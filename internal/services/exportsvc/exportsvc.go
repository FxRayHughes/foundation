// Package exportsvc 把前端表格导出（CSV / XLSX）落到用户通过原生「另存为」
// 对话框选定的路径，替代浏览器 blob 下载（webview 内行为不一致、无法选位置）。
//
// 约束：
//   - 路径必须是绝对路径、扩展名与格式匹配、父目录已存在（对话框选出的路径必然满足）
//   - 统一走 filex.WriteAtomic：写一半崩溃不会留下半截文件覆盖用户原文件
//   - CSV 写 UTF-8 BOM，保证 Excel 直接双击打开中文不乱码
//   - XLSX 用 excelize 生成真正的 Office Open XML，数字保持数值类型
package exportsvc

import (
	"bytes"
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strings"
	"unicode/utf8"

	"github.com/xuri/excelize/v2"

	"foundation/internal/utils/filex"
	"foundation/internal/utils/logx"
)

// Table 是 XLSX 导出的数据载荷。
// Rows 的元素来自前端 JSON：string / float64 / bool / nil。
type Table struct {
	SheetName string   `json:"sheetName"`
	Headers   []string `json:"headers"`
	Rows      [][]any  `json:"rows"`
}

// Service 暴露给前端的导出服务（无状态）。
type Service struct{}

func New() *Service { return &Service{} }

var utf8BOM = []byte{0xEF, 0xBB, 0xBF}

const (
	minColWidth = 8.0
	maxColWidth = 60.0
)

// WriteCSV 把 content 以 UTF-8（带 BOM）写到 path。content 已带 BOM 时不重复添加。
func (s *Service) WriteCSV(path string, content string) error {
	log := logx.For("export")
	if err := validatePath(path, ".csv"); err != nil {
		log.Warn("csv export rejected", "path", path, "err", err)
		return err
	}
	data := []byte(content)
	if !bytes.HasPrefix(data, utf8BOM) {
		data = append(append(make([]byte, 0, len(data)+len(utf8BOM)), utf8BOM...), data...)
	}
	if err := filex.WriteAtomic(path, data, 0o644); err != nil {
		log.Error("csv export failed", "path", path, "err", err)
		return fmt.Errorf("exportsvc: write csv: %w", err)
	}
	log.Info("csv exported", "path", path, "bytes", len(data))
	return nil
}

// WriteXLSX 生成 xlsx 写到 path：表头加粗 + 冻结首行 + 按内容估算列宽。
func (s *Service) WriteXLSX(path string, table Table) error {
	log := logx.For("export")
	if err := validatePath(path, ".xlsx"); err != nil {
		log.Warn("xlsx export rejected", "path", path, "err", err)
		return err
	}
	buf, err := buildXLSX(table)
	if err != nil {
		log.Error("xlsx build failed", "path", path, "err", err)
		return err
	}
	if err := filex.WriteAtomic(path, buf, 0o644); err != nil {
		log.Error("xlsx export failed", "path", path, "err", err)
		return fmt.Errorf("exportsvc: write xlsx: %w", err)
	}
	log.Info("xlsx exported", "path", path, "rows", len(table.Rows), "bytes", len(buf))
	return nil
}

func validatePath(path, ext string) error {
	if strings.TrimSpace(path) == "" {
		return errors.New("exportsvc: empty path")
	}
	if !filepath.IsAbs(path) {
		return fmt.Errorf("exportsvc: path must be absolute: %q", path)
	}
	if !strings.EqualFold(filepath.Ext(path), ext) {
		return fmt.Errorf("exportsvc: path must end with %s: %q", ext, path)
	}
	dir := filepath.Dir(path)
	st, err := os.Stat(dir)
	if err != nil {
		return fmt.Errorf("exportsvc: parent dir: %w", err)
	}
	if !st.IsDir() {
		return fmt.Errorf("exportsvc: parent is not a directory: %q", dir)
	}
	return nil
}

// sanitizeSheetName 满足 Excel 约束：非空、≤31 字符、不含 : \ / ? * [ ]、不以 ' 开头结尾。
func sanitizeSheetName(name string) string {
	name = strings.Map(func(r rune) rune {
		switch r {
		case ':', '\\', '/', '?', '*', '[', ']':
			return '_'
		}
		return r
	}, strings.TrimSpace(name))
	name = strings.Trim(name, "'")
	if utf8.RuneCountInString(name) > 31 {
		name = string([]rune(name)[:31])
	}
	if name == "" {
		name = "Sheet1"
	}
	return name
}

// displayWidth 粗略估算显示宽度：CJK 等宽字符按 2 计。
func displayWidth(s string) float64 {
	w := 0.0
	for _, r := range s {
		if r == '\n' {
			continue
		}
		if r >= 0x1100 && (r <= 0x115F || (r >= 0x2E80 && r <= 0xA4CF) ||
			(r >= 0xAC00 && r <= 0xD7A3) || (r >= 0xF900 && r <= 0xFAFF) ||
			(r >= 0xFE30 && r <= 0xFE4F) || (r >= 0xFF00 && r <= 0xFF60) ||
			(r >= 0xFFE0 && r <= 0xFFE6) || r >= 0x20000) {
			w += 2
		} else {
			w++
		}
	}
	return w
}

// normalizeCell 把 JSON 解码出的值转成 excelize 能保持类型的值。
// NaN / Inf 不是合法 Excel 数值，退化为空。
func normalizeCell(v any) any {
	switch x := v.(type) {
	case nil:
		return nil
	case float64:
		if math.IsNaN(x) || math.IsInf(x, 0) {
			return nil
		}
		return x
	case float32:
		return normalizeCell(float64(x))
	case string, bool, int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return x
	default:
		return fmt.Sprint(x)
	}
}

func cellText(v any) string {
	if v == nil {
		return ""
	}
	return fmt.Sprint(v)
}

func buildXLSX(table Table) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()

	sheet := sanitizeSheetName(table.SheetName)
	if err := f.SetSheetName("Sheet1", sheet); err != nil {
		return nil, fmt.Errorf("exportsvc: sheet name: %w", err)
	}

	cols := len(table.Headers)
	for _, r := range table.Rows {
		if len(r) > cols {
			cols = len(r)
		}
	}
	widths := make([]float64, cols)
	track := func(i int, s string) {
		if w := displayWidth(s); w > widths[i] {
			widths[i] = w
		}
	}

	sw, err := f.NewStreamWriter(sheet)
	if err != nil {
		return nil, fmt.Errorf("exportsvc: stream writer: %w", err)
	}

	// StreamWriter 约束：SetPanes / SetColWidth 必须在任何 SetRow 之前调用，
	// 所以先遍历一遍算出列宽。
	for i, h := range table.Headers {
		track(i, h)
	}
	for _, r := range table.Rows {
		for i, v := range r {
			track(i, cellText(normalizeCell(v)))
		}
	}
	if len(table.Headers) > 0 {
		if err := sw.SetPanes(&excelize.Panes{
			Freeze:      true,
			YSplit:      1,
			TopLeftCell: "A2",
			ActivePane:  "bottomLeft",
		}); err != nil {
			return nil, fmt.Errorf("exportsvc: freeze header: %w", err)
		}
	}
	for i, w := range widths {
		w = math.Min(math.Max(w+2, minColWidth), maxColWidth)
		if err := sw.SetColWidth(i+1, i+1, w); err != nil {
			return nil, fmt.Errorf("exportsvc: col width: %w", err)
		}
	}

	rowIdx := 1
	if len(table.Headers) > 0 {
		headerStyle, err := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true},
			Alignment: &excelize.Alignment{Vertical: "center"},
		})
		if err != nil {
			return nil, fmt.Errorf("exportsvc: header style: %w", err)
		}
		hdr := make([]any, len(table.Headers))
		for i, h := range table.Headers {
			hdr[i] = excelize.Cell{StyleID: headerStyle, Value: h}
		}
		if err := sw.SetRow("A1", hdr); err != nil {
			return nil, fmt.Errorf("exportsvc: header row: %w", err)
		}
		rowIdx++
	}

	for _, r := range table.Rows {
		vals := make([]any, len(r))
		for i, v := range r {
			vals[i] = normalizeCell(v)
		}
		cell, err := excelize.CoordinatesToCellName(1, rowIdx)
		if err != nil {
			return nil, err
		}
		if err := sw.SetRow(cell, vals); err != nil {
			return nil, fmt.Errorf("exportsvc: row %d: %w", rowIdx, err)
		}
		rowIdx++
	}
	if err := sw.Flush(); err != nil {
		return nil, fmt.Errorf("exportsvc: flush: %w", err)
	}

	var buf bytes.Buffer
	if _, err := f.WriteTo(&buf); err != nil {
		return nil, fmt.Errorf("exportsvc: encode xlsx: %w", err)
	}
	return buf.Bytes(), nil
}
