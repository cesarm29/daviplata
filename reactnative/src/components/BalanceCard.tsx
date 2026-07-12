import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../types';
import { defaultTheme } from '../theme/colors';

interface BalanceCardProps {
  balance: number;
  theme?: Theme;
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO')}`;
};

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, theme = defaultTheme }) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.secondary }]}>
      <Text style={styles.label}>Saldo disponible</Text>
      <Text style={styles.amount}>{formatCurrency(balance)}</Text>
      <Text style={styles.currency}>COP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  currency: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
  },
});

export default BalanceCard;
