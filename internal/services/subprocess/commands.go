package subprocess

import (
	"errors"
	"fmt"
	"path/filepath"
	"regexp"
)

// Command 白名单条目。
//
// 每加一行 = 给前端开一道权限。提交前请回答：
//  1. 这条命令的副作用范围（写文件 / 网络 / 修改系统）是否可接受？
//  2. 用户能否在 args 里传入路径 / shell 元字符？必须用 ArgPattern 卡死
//  3. 是否需要限制 Cwd 范围？
type Command struct {
	// Name 前端调用时用的逻辑名（如 "ping" / "git-status"）；不要直接 = 可执行文件名。
	Name string
	// Description 给 AvailableCommands 返回的人类可读描述。
	Description string
	// Exe 真正要执行的程序。**强烈建议用绝对路径**或者 PATH 中可解析的固定名。
	Exe string
	// PrependArgs 总是在用户参数之前注入的固定参数。
	// 用来锁死敏感开关（如 git --no-pager log；ping -n 等），让前端只能传"参数后缀"。
	PrependArgs []string
	// ArgPattern：用户传入的每个 arg 必须匹配该正则；nil 表示不允许传 arg。
	ArgPattern *regexp.Regexp
	// MaxArgs 用户参数最大数量；0 = 不允许 args；-1 = 不限制
	MaxArgs int
	// AllowedCwdRoots：允许的工作目录前缀列表；nil = 任意（含空）。
	// 通常应限制到应用数据目录子树，避免逃逸到系统目录。
	AllowedCwdRoots []string
}

func (c *Command) validateArgs(args []string) error {
	if c.MaxArgs == 0 && len(args) > 0 {
		return fmt.Errorf("subprocess: command %q does not accept arguments", c.Name)
	}
	if c.MaxArgs > 0 && len(args) > c.MaxArgs {
		return fmt.Errorf("subprocess: command %q allows at most %d arguments", c.Name, c.MaxArgs)
	}
	if c.ArgPattern == nil && len(args) > 0 {
		return fmt.Errorf("subprocess: command %q has no ArgPattern; rejecting arguments", c.Name)
	}
	for i, a := range args {
		if c.ArgPattern != nil && !c.ArgPattern.MatchString(a) {
			return fmt.Errorf("subprocess: command %q arg #%d %q rejected by pattern", c.Name, i, a)
		}
	}
	return nil
}

func (c *Command) validateCwd(cwd string) error {
	if cwd == "" {
		return nil
	}
	if len(c.AllowedCwdRoots) == 0 {
		return nil // 显式选择"无 cwd 限制"
	}
	abs, err := filepath.Abs(cwd)
	if err != nil {
		return err
	}
	for _, root := range c.AllowedCwdRoots {
		ar, err := filepath.Abs(root)
		if err != nil {
			continue
		}
		rel, err := filepath.Rel(ar, abs)
		if err != nil {
			continue
		}
		// 不能逃逸到 ar 之外
		if rel != ".." && !startsWithDotDotSep(rel) {
			return nil
		}
	}
	return errors.New("subprocess: cwd is outside allowed roots")
}

func startsWithDotDotSep(s string) bool {
	return len(s) >= 3 && s[0] == '.' && s[1] == '.' && (s[2] == '/' || s[2] == '\\')
}

// whitelist 是当前生效的命令清单。
//
// **默认空** —— 业务方按需增添。下面注释里的几个示例展示了常见模式，
// 取消注释前请确认你真的需要给前端开这个能力。
var whitelist = []Command{
	// 示例 1：ping，参数仅允许 host（字母数字 + .-:），最多 1 个 arg
	// {
	// 	Name:        "ping",
	// 	Description: "Ping a host (4 packets)",
	// 	Exe:         "ping",
	// 	PrependArgs: []string{"-n", "4"}, // Windows ping 用 -n；Linux 用 -c。跨平台时应分平台条目
	// 	ArgPattern:  regexp.MustCompile(`^[a-zA-Z0-9._:-]+$`),
	// 	MaxArgs:     1,
	// },

	// 示例 2：git status，固定参数无 arg
	// {
	// 	Name:        "git-status",
	// 	Description: "Show git status of allowed working directories",
	// 	Exe:         "git",
	// 	PrependArgs: []string{"--no-pager", "status", "--porcelain=v2"},
	// 	MaxArgs:     0, // 不允许追加 args
	// 	AllowedCwdRoots: []string{
	// 		// 业务方按需限制：例如只让 git 在用户数据目录子树跑
	// 	},
	// },
}

// lookupCommand 找到匹配的白名单条目。线性扫描足够（条目数永远不会多）。
func lookupCommand(name string) (*Command, bool) {
	for i := range whitelist {
		if whitelist[i].Name == name {
			return &whitelist[i], true
		}
	}
	return nil, false
}
