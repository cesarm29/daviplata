import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { BundleProps, Transaction } from '../types';
import { defaultTheme } from '../theme/colors';
import TransactionItem from '../components/TransactionItem';

const MovementsScreen: React.FC<BundleProps> = ({
  onEvent,
  userData,
  movementsData = [],
  theme = defaultTheme,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    onEvent?.('REFRESH_MOVEMENTS', { userData });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEndReached = () => {
    onEvent?.('LOAD_MORE_MOVEMENTS', { userData });
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
        <TouchableOpacity onPress={() => onEvent?.('BACK', { userData })} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Movimientos</Text>
      </View>

      <FlatList
        data={movementsData}
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
