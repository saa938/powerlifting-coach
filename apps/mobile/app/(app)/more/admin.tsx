import { View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Pill, Divider, Loading, ErrorState, EmptyState } from '@/components/ui';
import type { Report } from '@liftly/shared-types';
import { fmtDate } from '@/lib/format';

interface AdminV1 {
  v: 1;
  reports: Report[];
  pendingCredentials: number;
}

export default function Admin() {
  const { data, error, loading, refetch } = useApi(() => api.get<AdminV1>('/api/v1/admin'), []);

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading />
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

  const openReports = data.reports.filter((r) => r.status === 'open');

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Admin
      </Txt>

      <View className="flex-row gap-3 mb-4">
        <Card className="flex-1">
          <Txt variant="label">Open reports</Txt>
          <Txt variant="title">{openReports.length}</Txt>
        </Card>
        <Card className="flex-1">
          <Txt variant="label">Pending creds</Txt>
          <Txt variant="title">{data.pendingCredentials}</Txt>
        </Card>
      </View>

      <Txt variant="label" className="mb-2">
        Reports
      </Txt>
      {data.reports.length === 0 ? (
        <EmptyState title="Nothing to moderate" subtitle="No reports in the queue." />
      ) : null}
      <Card className="p-0">
        {data.reports.map((r, i) => (
          <View key={r.id}>
            {i > 0 ? <Divider /> : null}
            <View className="px-4 py-3">
              <View className="flex-row justify-between items-center">
                <Txt variant="body">{r.targetLabel ?? `${r.targetType} report`}</Txt>
                <Pill
                  label={r.status}
                  tone={r.status === 'open' ? 'amber' : r.status === 'resolved' ? 'green' : 'neutral'}
                />
              </View>
              <Txt variant="muted" className="mt-1">
                {r.reason} · {fmtDate(r.createdAt)}
              </Txt>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
