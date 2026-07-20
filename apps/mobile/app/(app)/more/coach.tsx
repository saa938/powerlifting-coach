import { Pressable, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import {
  Screen,
  Txt,
  Card,
  Pill,
  Divider,
  Loading,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import type { RosterEntry, TriageItem } from '@liftly/shared-types';
import { relativeDays } from '@/lib/format';

interface CoachRosterV1 {
  v: 1;
  roster: RosterEntry[];
  triage: TriageItem[];
}

function toneForDays(days: number | null): 'green' | 'amber' | 'red' {
  if (days == null) return 'red';
  if (days <= 3) return 'green';
  if (days <= 7) return 'amber';
  return 'red';
}

export default function Coach() {
  const { data, error, loading, refetch } = useApi(
    () => api.get<CoachRosterV1>('/api/v1/coach/roster'),
    [],
  );

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading label="Loading roster…" />
      </View>
    );
  }
  if (error && !data) {
    return (
      <Screen>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );
  }
  if (!data) return null;

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Coach console
      </Txt>

      {data.triage.length > 0 ? (
        <>
          <Txt variant="label" className="mb-2">
            Needs attention
          </Txt>
          {data.triage.slice(0, 5).map((t) => (
            <Card key={t.athleteId} className="mb-2">
              <View className="flex-row justify-between items-center">
                <Txt variant="heading">{t.name ?? t.email}</Txt>
                {t.pendingSuggestions > 0 ? (
                  <Pill label={`${t.pendingSuggestions} pending`} tone="blood" />
                ) : null}
              </View>
              {t.flags.slice(0, 2).map((f, i) => (
                <Txt key={i} variant="muted" className="mt-1">
                  • {f.title}
                </Txt>
              ))}
            </Card>
          ))}
        </>
      ) : null}

      <Txt variant="label" className="mb-2 mt-4">
        Roster
      </Txt>
      {data.roster.length === 0 ? (
        <EmptyState title="No athletes yet" subtitle="Invite athletes from the web console." />
      ) : null}
      <Card className="p-0">
        {data.roster.map((r: RosterEntry, i) => (
          <View key={r.athleteId}>
            {i > 0 ? <Divider /> : null}
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-1 pr-2">
                <Txt variant="body">{r.name ?? r.email}</Txt>
                <Txt variant="muted">last logged {relativeDays(r.daysSinceLastSession)}</Txt>
              </View>
              <Pill
                label={r.daysSinceLastSession == null ? 'never' : `${r.daysSinceLastSession}d`}
                tone={toneForDays(r.daysSinceLastSession)}
              />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
