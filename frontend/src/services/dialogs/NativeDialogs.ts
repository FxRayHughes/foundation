// NativeDialogsService：统一封装 Wails v3 的原生 dialog API。
//
// 规范：项目内所有"打开文件 / 保存文件 / 选择文件夹 / 确认对话框 / 错误提示"都
// 通过本服务调用，禁止使用浏览器 alert / confirm / prompt（在 webview 里观感差且
// 在 Wails 里行为不一致）。
//
// 实现细节：
//   - SaveFile / OpenFile / Info / Warning / Error / Question 全部走 @wailsio/runtime
//   - 把 PascalCase 字段名收口为本地的 camelCase API，对调用方更友好
//   - 用户取消时统一返回 null（而不是空字符串），避免上层判空写 if (path === '')
import { Dialogs } from '@wailsio/runtime';

export interface FileFilter {
  displayName: string;
  pattern: string; // e.g. "*.db;*.sqlite"
}

export interface OpenFileOptions {
  title?: string;
  message?: string;
  buttonText?: string;
  directory?: string;
  filters?: FileFilter[];
  allowsMultiple?: boolean;
  // 选择目录而非文件
  chooseDirectories?: boolean;
}

export interface SaveFileOptions {
  title?: string;
  message?: string;
  buttonText?: string;
  directory?: string;
  filename?: string;
  filters?: FileFilter[];
  canCreateDirectories?: boolean;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
}

const mapFilters = (filters?: FileFilter[]) =>
  filters?.map((f) => ({ DisplayName: f.displayName, Pattern: f.pattern }));

export const NativeDialogs = {
  // 打开文件选择器（单选）。取消返回 null。
  async openFile(options: OpenFileOptions = {}): Promise<string | null> {
    const result = await Dialogs.OpenFile({
      Title: options.title,
      Message: options.message,
      ButtonText: options.buttonText,
      Directory: options.directory,
      Filters: mapFilters(options.filters),
      CanChooseDirectories: options.chooseDirectories ?? false,
      CanChooseFiles: !options.chooseDirectories,
      AllowsMultipleSelection: false,
    });
    return result && result !== '' ? result : null;
  },

  // 打开文件选择器（多选）。取消返回空数组。
  async openFiles(options: OpenFileOptions = {}): Promise<string[]> {
    const result = await Dialogs.OpenFile({
      Title: options.title,
      Message: options.message,
      ButtonText: options.buttonText,
      Directory: options.directory,
      Filters: mapFilters(options.filters),
      CanChooseDirectories: options.chooseDirectories ?? false,
      CanChooseFiles: !options.chooseDirectories,
      AllowsMultipleSelection: true,
    });
    return Array.isArray(result) ? result : [];
  },

  // 选择文件夹。取消返回 null。
  async openDirectory(options: Omit<OpenFileOptions, 'chooseDirectories' | 'filters'> = {}): Promise<string | null> {
    const result = await Dialogs.OpenFile({
      Title: options.title,
      Message: options.message,
      ButtonText: options.buttonText,
      Directory: options.directory,
      CanChooseDirectories: true,
      CanChooseFiles: false,
      CanCreateDirectories: true,
      AllowsMultipleSelection: false,
    });
    return result && result !== '' ? result : null;
  },

  // 保存文件对话框。取消返回 null。
  async saveFile(options: SaveFileOptions = {}): Promise<string | null> {
    const result = await Dialogs.SaveFile({
      Title: options.title,
      Message: options.message,
      ButtonText: options.buttonText,
      Directory: options.directory,
      Filename: options.filename,
      Filters: mapFilters(options.filters),
      CanCreateDirectories: options.canCreateDirectories ?? true,
    });
    return result && result !== '' ? result : null;
  },

  // 二选一确认。OK 返回 true，Cancel / 关闭返回 false。
  async confirm(options: ConfirmOptions): Promise<boolean> {
    const okLabel = options.okLabel ?? 'OK';
    const cancelLabel = options.cancelLabel ?? 'Cancel';
    const choice = await Dialogs.Question({
      Title: options.title,
      Message: options.message,
      Buttons: [
        { Label: okLabel, IsDefault: true },
        { Label: cancelLabel, IsCancel: true },
      ],
    });
    return choice === okLabel;
  },

  async info(title: string, message: string): Promise<void> {
    await Dialogs.Info({ Title: title, Message: message });
  },

  async warning(title: string, message: string): Promise<void> {
    await Dialogs.Warning({ Title: title, Message: message });
  },

  async error(title: string, message: string): Promise<void> {
    await Dialogs.Error({ Title: title, Message: message });
  },
} as const;
