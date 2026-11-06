import { Button, Text, TextInput } from '@mantine/core';
import { IconBellRinging, IconExternalLink } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { useHomePage } from './useHomePage';
import classes from './HomePage.module.css';

// Home 页面：脚手架占位首页 —— 只演示 Greet 调用 + time 事件订阅。
// 所有人类可见文本必须走 t() —— 不允许在 JSX 里硬编码中/英文。
export const HomePage = () => {
  const t = useT();
  const {
    name, setName, result, time, loading, error, greet,
    openConfirm, openMessage, openBlank, childResult,
    systrayEnabled, systrayBusy, systrayError, toggleSystray,
  } = useHomePage();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void greet();
  };

  const openIcon = <IconExternalLink size={18} stroke={1.75} />;

  return (
    <div className={classes.root}>
      <div className={classes.body}>
        <Text className={classes.eyebrow}>{t('home.eyebrow')}</Text>
        <h1 className={classes.hero}>{t('home.hero')}</h1>
        <Text className={classes.subtitle}>
          {t('home.subtitle', { file: 'internal/services/greet/greet.go' })}
        </Text>

        <div className={classes.card}>
          <Text className={classes.cardTitle}>{t('home.backendCard.title')}</Text>
          <Text className={classes.result}>{result ?? t('home.backendCard.defaultResult')}</Text>
          <form className={classes.form} onSubmit={onSubmit}>
            <TextInput
              className={classes.input}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder={t('home.backendCard.placeholder')}
              autoComplete="off"
              disabled={loading}
            />
            <Button type="submit" variant="filled" disabled={loading}>
              {loading ? t('home.backendCard.submitting') : t('home.backendCard.submit')}
            </Button>
          </form>
          {error && (
            <Text className={classes.error}>
              {t('home.backendCard.errorPrefix')}{error}
            </Text>
          )}
        </div>

        <div className={classes.card}>
          <Text className={classes.cardTitle}>{t('home.childWindowCard.title')}</Text>
          <Text className={classes.cardDescription}>{t('home.childWindowCard.description')}</Text>
          <div className={classes.actions}>
            <Button variant="outline" size="xs" leftSection={openIcon} onClick={() => void openConfirm()}>
              {t('home.childWindowCard.confirmBtn')}
            </Button>
            <Button variant="outline" size="xs" leftSection={openIcon} onClick={() => void openMessage()}>
              {t('home.childWindowCard.messageBtn')}
            </Button>
            <Button variant="outline" size="xs" leftSection={openIcon} onClick={() => void openBlank()}>
              {t('home.childWindowCard.blankBtn')}
            </Button>
          </div>
          {childResult && (
            <Text className={classes.childResult}>
              {t('home.childWindowCard.resultPrefix')}{childResult}
            </Text>
          )}
        </div>

        <div className={classes.card}>
          <Text className={classes.cardTitle}>{t('home.systrayCard.title')}</Text>
          <Text className={classes.cardDescription}>{t('home.systrayCard.description')}</Text>
          <div className={classes.actions}>
            <Button
              variant={systrayEnabled ? 'filled' : 'outline'}
              size="xs"
              className={systrayEnabled ? classes.systrayDanger : undefined}
              leftSection={<IconBellRinging size={18} stroke={1.75} />}
              loading={systrayBusy}
              onClick={() => void toggleSystray()}
            >
              {systrayEnabled ? t('home.systrayCard.disableBtn') : t('home.systrayCard.enableBtn')}
            </Button>
            <Text className={classes.systrayStatus}>
              {systrayEnabled ? t('home.systrayCard.statusOn') : t('home.systrayCard.statusOff')}
            </Text>
          </div>
          {systrayError && (
            <Text className={classes.error}>
              {t('home.systrayCard.errorPrefix')}{systrayError}
            </Text>
          )}
        </div>

        <div className={classes.footer}>
          <span>{t('home.footer.backendTick', { time: time || '—' })}</span>
          <span>{t('home.footer.poweredBy')}</span>
        </div>
      </div>
    </div>
  );
};
