import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Txt, Loading, ErrorState } from '@/components/ui';
import { colors } from '@/theme/tokens';
import type { ChatMessage } from '@liftly/shared-types';

export default function Chat() {
  const insets = useSafeAreaInsets();
  const { data, error, loading, refetch } = useApi(() => api.getChat(), []);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);

  const messages: ChatMessage[] = [...(data?.messages ?? []), ...optimistic];

  async function send() {
    const content = draft.trim();
    if (!content || sending) return;
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      athleteId: '',
      role: 'user',
      content,
      createdAt: Date.now(),
    };
    setOptimistic((prev) => [...prev, userMsg]);
    setDraft('');
    setSending(true);
    try {
      await api.sendChat({ message: content });
      setOptimistic([]);
      refetch();
    } catch {
      setOptimistic((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          athleteId: '',
          role: 'assistant',
          content: 'Sorry — I could not reach the coach. Try again.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.iron900, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="px-5 py-3">
        <Txt variant="title">AI Coach</Txt>
      </View>

      {loading && !data ? <Loading /> : null}
      {error && !data ? (
        <View className="px-5">
          <ErrorState error={error} onRetry={refetch} />
        </View>
      ) : null}

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        {messages.map((m) => (
          <View
            key={m.id}
            className={`my-1.5 max-w-[85%] rounded-2xl px-4 py-2.5 ${
              m.role === 'user' ? 'self-end bg-blood' : 'self-start bg-iron-800 border border-iron-700'
            }`}
          >
            <Txt variant="body" className={m.role === 'user' ? 'text-white' : ''}>
              {m.content}
            </Txt>
          </View>
        ))}
        {sending ? (
          <View className="self-start my-1.5 rounded-2xl px-4 py-2.5 bg-iron-800 border border-iron-700">
            <Txt variant="muted">Coach is thinking…</Txt>
          </View>
        ) : null}
      </ScrollView>

      <View
        className="flex-row items-end gap-2 px-4 pt-2 border-t border-iron-700"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask your coach…"
          placeholderTextColor={colors.chalkFaint}
          multiline
          className="flex-1 max-h-32 rounded-2xl bg-iron-800 border border-iron-700 px-4 py-2.5 text-chalk font-sans"
        />
        <Pressable
          onPress={send}
          disabled={sending || !draft.trim()}
          className={`w-11 h-11 rounded-full items-center justify-center ${
            draft.trim() ? 'bg-blood' : 'bg-iron-700'
          }`}
        >
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
