// 服务层：负责与 Wails 后端 bindings 通信，对上层屏蔽具体绑定路径。
// 替换项目名后只需修改本文件的 import 来源。
//
// 注意：bindings/foundation/internal/services/greet 由 wails3 generate bindings
// 自动生成，首次启动 dev / 运行 generate 命令后才会出现。
import { Service as GreetServiceBinding } from '@bindings/foundation/internal/services/greet';

export const GreetService = {
  greet(name: string): Promise<string> {
    return GreetServiceBinding.Greet(name);
  },
} as const;
