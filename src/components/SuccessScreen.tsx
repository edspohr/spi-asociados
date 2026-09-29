import { useLang } from '../i18n/lang';

const SPI_LOGO = '/logo.png';

type Props = { inserted: number; onNew: () => void };

export function SuccessScreen({ inserted, onNew }: Props) {
  const { t } = useLang();
  const [bodyPre, bodyCount, bodyPost] = t.successBody(inserted);
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-14 w-auto" />
          <h1 className="text-xl font-semibold text-primary">{t.appTitle}</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-6 py-12">
        <div
          role="status"
          className="w-full rounded-lg border border-success/40 bg-emerald-50 p-6"
        >
          <h2 className="text-lg font-semibold text-success">{t.successTitle}</h2>
          <p className="mt-2 text-sm text-text">
            {bodyPre}
            <strong>{bodyCount}</strong>
            {bodyPost}
          </p>
          <p className="mt-2 text-sm text-text-muted">{t.successFollowUp}</p>
        </div>

        <button
          type="button"
          onClick={onNew}
          className="rounded border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted"
        >
          {t.submitAnother}
        </button>
      </main>
    </div>
  );
}
