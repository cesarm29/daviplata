import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction, Theme } from '../types';
import { defaultTheme } from '../theme/colors';

interface TransactionItemProps {
  transaction: Transaction;
  theme?: Theme;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  theme = defaultTheme,
}) => {
  const isCredit = transaction.type === 'CREDIT';
  const amountColor = isCredit ? theme.success : theme.error;
  const prefix = isCredit ? '+' : '-';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' },
          ]}
        >
          <Text style={[styles.typeText, { color: isCredit ? theme.success : theme.error }]}>
            {isCredit ? 'Recibido' : 'Enviado'}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
            {transaction.description || (isCredit ? 'Transferencia recibida' : `Envío a ${transaction.destinationPhone}`)}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {new Date(transaction.createdAt).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}${transaction.amount.toLocaleString('es-CO')}
        </Text>
        <Text
          style={[
            styles.status,
            {
              color:
                transaction.status === 'COMPLETED'
                  ? theme.success
                  : transaction.status === 'FAILED'
                  ? theme.error
                  : theme.textSecondary,
            },
          ]}
        >
          {transaction.status === 'COMPLETED'
            ? 'Completado'
            : transaction.status === 'FAILED'
            ? 'Fallido'
            : 'Pendiente'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
  },
});

export default TransactionItem;
