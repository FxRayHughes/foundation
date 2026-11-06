package exportsvc

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"

	"github.com/xuri/excelize/v2"
)

func TestWriteCSV(t *testing.T) {
	s := New()
	path := filepath.Join(t.TempDir(), "out.csv")
	if err := s.WriteCSV(path, "名称,值\n苹果,1\n"); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.HasPrefix(data, utf8BOM) {
		t.Fatalf("missing BOM: % x", data[:3])
	}
	if got := string(data[3:]); got != "名称,值\n苹果,1\n" {
		t.Fatalf("content = %q", got)
	}

	// 已带 BOM 的内容不重复添加
	if err := s.WriteCSV(path, "\ufeffa,b\n"); err != nil {
		t.Fatal(err)
	}
	data, _ = os.ReadFile(path)
	if bytes.HasPrefix(data[3:], utf8BOM) {
		t.Fatal("BOM duplicated")
	}
}

func TestWriteXLSX(t *testing.T) {
	s := New()
	path := filepath.Join(t.TempDir(), "out.xlsx")
	table := Table{
		SheetName: "数据/报表",
		Headers:   []string{"名称", "数量", "启用"},
		Rows: [][]any{
			{"苹果", float64(12.5), true},
			{"香蕉", float64(3), nil},
		},
	}
	if err := s.WriteXLSX(path, table); err != nil {
		t.Fatal(err)
	}
	f, err := excelize.OpenFile(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	sheet := "数据_报表"
	if idx, _ := f.GetSheetIndex(sheet); idx < 0 {
		t.Fatalf("sheet %q not found: %v", sheet, f.GetSheetList())
	}
	check := func(cell, want string) {
		t.Helper()
		got, err := f.GetCellValue(sheet, cell)
		if err != nil || got != want {
			t.Fatalf("%s = %q (%v), want %q", cell, got, err, want)
		}
	}
	check("A1", "名称")
	check("B1", "数量")
	check("A2", "苹果")
	check("B2", "12.5")
	check("C2", "TRUE")
	check("B3", "3")
	check("C3", "")

	if typ, _ := f.GetCellType(sheet, "B2"); typ == excelize.CellTypeSharedString || typ == excelize.CellTypeInlineString {
		t.Fatalf("B2 should be numeric, got type %v", typ)
	}
	styleID, _ := f.GetCellStyle(sheet, "A1")
	style, err := f.GetStyle(styleID)
	if err != nil || style.Font == nil || !style.Font.Bold {
		t.Fatalf("header not bold: %+v %v", style, err)
	}
	panes, err := f.GetPanes(sheet)
	if err != nil || !panes.Freeze || panes.YSplit != 1 {
		t.Fatalf("header not frozen: %+v %v", panes, err)
	}
}

func TestValidatePath(t *testing.T) {
	s := New()
	dir := t.TempDir()
	cases := []string{
		"",
		"relative.csv",
		filepath.Join(dir, "wrong.txt"),
		filepath.Join(dir, "missing", "x.csv"),
	}
	for _, p := range cases {
		if err := s.WriteCSV(p, "x"); err == nil {
			t.Errorf("expected error for %q", p)
		}
	}
	if err := s.WriteXLSX(filepath.Join(dir, "a.csv"), Table{}); err == nil {
		t.Error("expected ext mismatch error for xlsx")
	}
}
