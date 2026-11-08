import { useState } from 'react';
import * as usageApi from '../api/usageApi.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { SelectField } from '../components/ui/SelectField.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { DailyUsageChart } from '../components/usage/DailyUsageChart.jsx';
import { EmptyUsage } from '../components/usage/EmptyUsage.jsx';
import { RecentCallsTable } from '../components/usage/RecentCallsTable.jsx';
import { UsageStatCards } from '../components/usage/UsageStatCards.jsx';
import { useResource } from '../hooks/useResource.js';
import t from '../i18n/es.js';

const PERIODS = [7, 30, 90];
const PERIOD_OPTIONS = PERIODS.map((days) => ({ value: days, label: t.usage.periodOption(days) }));

const loadSummary = (days, signal) => usageApi.getUsageSummary(days, { signal });

/** Panel de consumo de IA del usuario. */
export function UsagePage() {
  const [days, setDays] = useState(30);
  const { data, staleData, error, loading, reload } = useResource(loadSummary, days);
  // Al cambiar de periodo se mantiene el anterior atenuado: sin parpadeo ni saltos de página
  const summary = data ?? staleData;

  let content;
  if (error) content = <ErrorState title={t.usage.loadError} description={error.message} onRetry={reload} />;
  else if (!summary) content = <LoadingState label={t.usage.loading} />;
  else if (summary.totals.calls === 0) content = <EmptyUsage days={summary.period.days} />;
  else
    content = (
      <div className="space-y-6">
        <UsageStatCards totals={summary.totals} latency={summary.latency} />
        <DailyUsageChart key={summary.period.days} daily={summary.daily} />
        <RecentCallsTable calls={summary.recent_calls} />
      </div>
    );

  return (
    <AppLayout>
      <TextLink to="/">{t.nav.backToProjects}</TextLink>
      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.usage.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.usage.subtitle}</p>
        </div>
        <SelectField
          id="usage-period"
          label={t.usage.periodLabel}
          options={PERIOD_OPTIONS}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="sm:w-44 sm:shrink-0"
        />
      </div>

      <p role="status" className="sr-only">
        {loading ? t.usage.loading : ''}
      </p>
      <div aria-busy={loading} className={loading && summary ? 'opacity-60 transition-opacity' : ''}>
        {content}
      </div>
    </AppLayout>
  );
}
