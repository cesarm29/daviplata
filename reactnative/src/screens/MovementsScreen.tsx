import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { BundleProps, Transaction } from '../types';
import { defaultTheme } from '../theme/colors';
import { bridge } from '../services/bridge';
import TransactionItem from '../components/TransactionItem';

const MovementsScreen: React.FC<BundleProps> = ({ userId, name, phone, token, theme = defaultTheme }) => {
  const [movements, setMovements] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovements = async (pageNum: number, isRefresh: boolean = false) => {
    if (!token) return;
    try {
      const result = await bridge.getMovements(token, pageNum);
      if (isRefresh || pageNum === 1) {
        setMovements(result.transactions || []);
      } else {
        setMovements(prev => [...prev, ...(result.transactions || [])]);
      }
      setHasMore((result.transactions?.length || 0) >= 20);
    } catch {
    }
  };

  useEffect(() => {
    fetchMovements(1, true);
  }, [token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchMovements(1, true);
    setRefreshing(false);
  };

  const handleEndReached = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovements(nextPage);
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} theme={theme} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin movimientos</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => bridge.sendEvent('BACK', { token, userId, name, phone })} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Movimientos</Text>
      </View>

      <FlatList
        data={movements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default MovementsScreen;