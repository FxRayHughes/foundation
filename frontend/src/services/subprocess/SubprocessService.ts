// SubprocessService：白名单子进程的前端入口。
//
// 安全说明：后端只允许执行 commands.go 白名单内的命令，并对参数做正则校验。
// 业务前端能看见 / 调用什么，完全取决于后端白名单条目。
//
// 输出流：通过 Wails Events 推送：
//   - subprocess:stdout:<id>
//   - subprocess:stderr:<id>
//   - subprocess:exit:<id>
// 业务方用 onLine / onExit 订阅即可，无需直接接 Events。
import { Events } from '@wailsio/runtime';
import { Service as Binding } from '@bindings/foundation/internal/services/subprocess';

export interface RunSpec {
  name: string;     // 白名单 key
  args?: string[];
  cwd?: string;
}

export interface RunResult {
  id: number;
  pid: number;
}

export interface AvailableCommand {
  name: string;
  description: string;
}

export interface SubprocessItem {
  id: number;
  name: string;
  pid: number;
}

export interface ExitInfo {
  id: number;
  exitCode: number;
  error: string;
}

const PREFIX = 'subprocess';

export const SubprocessService = {
  async availableCommands(): Promise<AvailableCommand[]> {
    const list = await Binding.AvailableCommands();
    return (list ?? []).map((c) => ({
      name: c.name ?? '',
      description: c.description ?? '',
    }));
  },

  async run(spec: RunSpec): Promise<RunResult> {
    const r = await Binding.Run({
      name: spec.name,
      args: spec.args ?? [],
      cwd: spec.cwd ?? '',
    });
    return { id: Number(r.id ?? 0), pid: Number(r.pid ?? 0) };
  },

  async stop(id: number): Promise<void> {
    await Binding.Stop(id);
  },

  async list(): Promise<SubprocessItem[]> {
    const list = await Binding.List();
    return (list ?? []).map<SubprocessItem>((it) => ({
      id: Number(it.id ?? 0),
      name: it.name ?? '',
      pid: Number(it.pid ?? 0),
    }));
  },

  // 订阅指定子进程的输出行。返回取消函数（务必 useEffect 里 return 它）。
  onLine(
    id: number,
    handler: (line: string, stream: 'stdout' | 'stderr') => void,
  ): () => void {
    const cleanups: Array<() => void> = [];
    for (const stream of ['stdout', 'stderr'] as const) {
      const event = `${PREFIX}:${stream}:${id}`;
      const off = Events.On(event, (e) => {
        const data = e?.data as { line?: string } | undefined;
        if (data && typeof data.line === 'string') {
          handler(data.line, stream);
        }
      });
      cleanups.push(off);
    }
    return () => cleanups.forEach((fn) => fn());
  },

  // 订阅子进程退出事件。
  onExit(id: number, handler: (info: ExitInfo) => void): () => void {
    const event = `${PREFIX}:exit:${id}`;
    return Events.On(event, (e) => {
      const data = e?.data as ExitInfo | undefined;
      if (!data) return;
      handler({
        id: Number(data.id ?? 0),
        exitCode: Number(data.exitCode ?? 0),
        error: data.error ?? '',
      });
    });
  },
} as const;
