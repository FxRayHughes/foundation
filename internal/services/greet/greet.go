package greet

// Service 演示 Wails 服务：方法会被自动绑定到前端，
// 可在前端通过 `import { GreetService } from "bindings/foundation/internal/services/greet"` 调用。
type Service struct{}

func New() *Service {
	return &Service{}
}

func (s *Service) Greet(name string) string {
	if name == "" {
		name = "anonymous"
	}
	return "Hello " + name + "!"
}
