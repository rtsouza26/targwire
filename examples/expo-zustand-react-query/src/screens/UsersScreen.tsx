import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUsersQuery } from '../hooks/useUsersQuery';
import { useUserFilterStore } from '../state/userFilterStore';

export default function UsersScreen() {
  const { data, isLoading, isError, refetch, isRefetching, error } = useUsersQuery();
  const search = useUserFilterStore((s) => s.search);
  const setSearch = useUserFilterStore((s) => s.setSearch);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Users (Decorators + React Query + Zustand)</Text>
      <TextInput
        placeholder=\"Filtrar por nome, username ou email\"
        placeholderTextColor=\"#666\"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {isLoading && <ActivityIndicator size=\"large\" color=\"#2563eb\" />}

      {isError && (
        <Text style={styles.errorText}>{(error as Error)?.message ?? 'Erro ao carregar usuários'}</Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>@{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={
          !isLoading && !isError ? (
            <Text style={styles.empty}>Nenhum usuário encontrado.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#0b1220',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  input: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    color: '#e5e7eb',
  },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  username: {
    fontSize: 14,
    color: '#60a5fa',
  },
  email: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
});
