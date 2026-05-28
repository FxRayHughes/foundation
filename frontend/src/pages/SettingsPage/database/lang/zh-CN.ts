import type { Messages } from '@/i18n';

export const databaseZhCN: Messages = {
  settings: {
    database: {
      title: '数据存储',
      hint: '应用所有偏好与设置保存在 SQLite 数据库中。可以把数据库文件移到任意你信任的位置；切换时会自动迁移数据。',
      currentPathLabel: '当前位置',
      defaultPathLabel: '默认位置',
      sizeLabel: '占用空间',
      customBadge: '自定义',
      defaultBadge: '默认',
      actions: {
        change: '更改位置…',
        reset: '重置为默认',
      },
      // 原生「另存为」对话框文案
      dialog: {
        title: '选择新的数据库文件位置',
        message: '现有数据会自动复制到所选位置。',
        confirm: '保存到此处',
        filterDb: 'SQLite 数据库 (*.db, *.sqlite)',
      },
      // 重置确认对话框文案
      confirmReset: {
        title: '恢复默认位置',
        message: '将把数据库文件迁回平台默认目录。是否继续？',
        ok: '迁回默认',
        cancel: '取消',
      },
      // 单表清空确认对话框
      confirmClear: {
        title: '清空 {{label}}',
        message: '将删除「{{label}}」中的全部 {{rows}} 行数据。该操作不可撤销，是否继续？',
        ok: '清空',
        cancel: '取消',
      },
      feedback: {
        changing: '正在迁移数据库…',
        changed: '已切换到新位置',
        resetting: '正在恢复默认位置…',
        reset: '已恢复默认位置',
        clearing: '正在清空「{{label}}」…',
        cleared: '已清空「{{label}}」',
        failed: '操作失败：{{message}}',
      },
      charts: {
        share: {
          title: '空间占比',
          hint: '各表在数据库中的相对占用比例。',
        },
        bytes: {
          title: '字节用量',
          hint: '各表的实际字节占用（含索引页）。',
        },
        empty: '暂无数据',
        estimatedNote: '部分表为估算值（按行数比例推算）。',
      },
      // 表清单
      tables: {
        title: '数据表',
        empty: '没有可展示的表。',
        meta: '行数 {{rows}} · {{size}}',
        clear: '清空',
        clearAria: '清空 {{label}}',
        protected: '受保护',
        protectedAria: '{{label}} 受保护，不可一键清空',
        estimatedTag: '估算',
        // 每张表的标签 / 描述：键名与 internal/storage/models.go 的 ModelDescriptor.LabelKey 对齐
        preferences: {
          label: '行为偏好',
          description: '界面开关 / 显隐设置等键值对，可重建。',
        },
        appSettings: {
          label: '应用设置',
          description: '主题选择 / 自定义主题 / 语言。涉及视觉一致性，不允许一键清空。',
        },
      },
    },
  },
};
