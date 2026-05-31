import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { I18nProvider, registerFoundationLocales } from '@/i18n';
import { buildMuiTheme, lightPreset } from '@/styles/themes';
import { getChildWindowParams } from '@/services/childwindow';
import { ConfirmWindow, registerConfirmWindowLocales } from '@/childwindows/ConfirmWindow';
import { MessageWindow, registerMessageWindowLocales } from '@/childwindows/MessageWindow';
import { BlankWindow, registerBlankWindowLocales } from '@/childwindows/BlankWindow';

registerFoundationLocales();
registerConfirmWindowLocales();
registerMessageWindowLocales();
registerBlankWindowLocales();

const params = getChildWindowParams();

function ChildApp() {
  const theme = buildMuiTheme(lightPreset);

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {content}
      </ThemeProvider>
    </I18nProvider>
  );
}

const root = document.getElementById('child-root');
if (root) {
  createRoot(root).render(<ChildApp />);
}
