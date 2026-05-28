// Package cryptox 提供应用级对称加密：把 token / API key / 用户输入的密钥
// 这类敏感字符串落到 SQLite 时，统一过这一层。
//
// 设计要点：
//   - 算法：AES-256-GCM（authenticated encryption），抗篡改
//   - 主密钥来源：用户配置目录下 ~/.../<AppName>/.master.key（首次启动生成 32B 随机字节）
//   - 输出格式：base64( 1B version | 12B nonce | ciphertext+tag )
//     - version 留作 key rotation 升级位（当前 0x01）
//   - 业务用法：cryptox.EncryptString(plain) / cryptox.DecryptString(ciphertext)
//
// 安全边界：
//   - .master.key 的安全性 = 用户系统的文件权限。这里**不是**银行级加密，
//     目标是"防止顺手 grep db 文件能直接拿到 token"，对抗本地 root 不在范围内
//   - 对抗本地 root 需要走 OS 级凭证存储（Windows DPAPI / macOS Keychain /
//     libsecret），后续可在 cryptox 顶层加抽象层
package cryptox

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

// version1 标志当前编码格式；将来换密钥派生 / 算法时递增。
const version1 byte = 0x01

const (
	keySize   = 32 // AES-256
	nonceSize = 12 // GCM 推荐
)

// AppDirName 应与 internal/storage.AppDirName 保持一致；这里独立常量
// 避免 cryptox → storage 的反向依赖。改业务名时同步两处。
const AppDirName = "Foundation"

// MasterKeyFileName 主密钥文件；与数据库默认目录平级。
const MasterKeyFileName = ".master.key"

var (
	keyOnce sync.Once
	keyVal  []byte
	keyErr  error
)

// loadOrCreateKey 读 / 生成主密钥；并发安全（sync.Once）。
//
// 路径策略：和 storage.userDataDir 同源（避免引入循环依赖，这里复制一份逻辑）。
func loadOrCreateKey() ([]byte, error) {
	keyOnce.Do(func() {
		dir, err := masterKeyDir()
		if err != nil {
			keyErr = err
			return
		}
		if err := os.MkdirAll(dir, 0o700); err != nil {
			keyErr = fmt.Errorf("cryptox: ensure dir: %w", err)
			return
		}
		path := filepath.Join(dir, MasterKeyFileName)

		data, err := os.ReadFile(path)
		if err == nil && len(data) == keySize {
			keyVal = data
			return
		}
		// 不存在或损坏 → 生成新 key
		nk := make([]byte, keySize)
		if _, err := io.ReadFull(rand.Reader, nk); err != nil {
			keyErr = fmt.Errorf("cryptox: generate key: %w", err)
			return
		}
		// 0o600：仅当前用户可读写
		if err := os.WriteFile(path, nk, 0o600); err != nil {
			keyErr = fmt.Errorf("cryptox: persist key: %w", err)
			return
		}
		keyVal = nk
	})
	return keyVal, keyErr
}

func masterKeyDir() (string, error) {
	switch runtime.GOOS {
	case "windows":
		if v := os.Getenv("AppData"); v != "" {
			return filepath.Join(v, AppDirName), nil
		}
		base, err := os.UserConfigDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(base, AppDirName), nil
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, "Library", "Application Support", AppDirName), nil
	default:
		if v := os.Getenv("XDG_DATA_HOME"); v != "" {
			return filepath.Join(v, AppDirName), nil
		}
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, ".local", "share", AppDirName), nil
	}
}

func aead() (cipher.AEAD, error) {
	key, err := loadOrCreateKey()
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

// EncryptString 把明文加密成 base64 串；空字符串原样返回（避免误把"未设置"和"加密的空"混淆）。
func EncryptString(plain string) (string, error) {
	if plain == "" {
		return "", nil
	}
	g, err := aead()
	if err != nil {
		return "", err
	}
	nonce := make([]byte, nonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("cryptox: nonce: %w", err)
	}
	cipherText := g.Seal(nil, nonce, []byte(plain), nil)

	buf := make([]byte, 0, 1+nonceSize+len(cipherText))
	buf = append(buf, version1)
	buf = append(buf, nonce...)
	buf = append(buf, cipherText...)
	return base64.StdEncoding.EncodeToString(buf), nil
}

// DecryptString 把 EncryptString 的结果解开。空串原样返回。
// 对未识别版本 / 解密失败统一返回 ErrInvalidCiphertext，业务方不必关心细节。
func DecryptString(s string) (string, error) {
	if s == "" {
		return "", nil
	}
	raw, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return "", ErrInvalidCiphertext
	}
	if len(raw) < 1+nonceSize+16 { // 1 ver + 12 nonce + 至少 16B GCM tag
		return "", ErrInvalidCiphertext
	}
	if raw[0] != version1 {
		return "", ErrInvalidCiphertext
	}
	nonce := raw[1 : 1+nonceSize]
	body := raw[1+nonceSize:]

	g, err := aead()
	if err != nil {
		return "", err
	}
	plain, err := g.Open(nil, nonce, body, nil)
	if err != nil {
		return "", ErrInvalidCiphertext
	}
	return string(plain), nil
}

// ErrInvalidCiphertext 表示密文格式 / 完整性 / 密钥不匹配。
// 业务方可以 errors.Is 比较。
var ErrInvalidCiphertext = errors.New("cryptox: invalid ciphertext")
