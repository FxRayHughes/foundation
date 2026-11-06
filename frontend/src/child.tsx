import { createRoot } from 'react-dom/client';
import '@/styles';
import { I18nProvider, registerFoundationLocales } from '@/i18n';
import { FoundationThemeProvider, registerFoundationThemes } from '@/styles/themes';
import { getChildWindowParams } from '@/services/childwindow';
import { ConfirmWindow, registerConfirmWindowLocales } from '@/childwindows/ConfirmWindow';
import { MessageWindow, registerMessageWindowLocales } from '@/childwindows/MessageWindow';
import { BlankWindow, registerBlankWindowLocales } from '@/childwindows/BlankWindow';

registerFoundationThemes();
registerFoundationLocales();
registerConfirmWindowLocales();
registerMessageWindowLocales();
registerBlankWindowLocales();

const params = getChildWindowParams();

// 子窗口与主窗口共用 FoundationThemeProvider：启动时从 SQLite 读主题选择，
// 并订阅 appsettings:changed，主窗口切主题时同步刷新。

function ChildApp() {

  let content: React.ReactNode;
  switch (params.type) {
    case 'confirm':
      content = <ConfirmWindow />;
      break;
    case 'message':
      content = <MessageWindow />;
      break;
    default:
      content = <BlankWindow />;
  }

  return (
    <I18nProvider>
      <FoundationThemeProvider>
        {content}
      </FoundationThemeProvider>
    </I18nProvider>
  );
}

const root = document.getElementById('child-root');
if (root) {
  createRoot(root).render(<ChildApp />);
}
