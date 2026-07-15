import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BundleProps } from '../types';
import { defaultTheme } from '../theme/colors';
import { bridge } from '../services/bridge';
import BalanceCard from '../components/BalanceCard';

const HomeScreen: React.FC<BundleProps> = ({ userId, name, phone, token, accountNumber: initialAccountNumber, balance: initialBalance, theme = defaultTheme }) => {
  const [balance, setBalance] = useState(initialBalance || 0);
  const [accountNo, setAccountNo] = useState(initialAccountNumber || '');

  useEffect(() => {
    if (token) {
      bridge.getBalance(token).then((result) => {
        setBalance(result.balance);
        setAccountNo(result.accountNumber);
      }).catch(() => {});
    }
  }, [token]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('es-CO')}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>Hola, {name || 'Usuario'}</Text>
        <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Saldo disponible</Text>
        <Text style={[styles.balance, { color: theme.primary }]}>{formatCurrency(balance)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.primary }]}
          onPress={() => bridge.sendEvent('OPEN_TRANSFER', { token, userId, name, phone, balance })}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>$</Text>
          <Text style={styles.actionTitle}>Transferir</Text>
          <Text style={styles.actionSubtitle}>Enviar dinero</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.secondary }]}
          onPress={() => bridge.sendEvent('OPEN_MOVEMENTS', { token, userId, name, phone })}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>#</Text>
          <Text style={styles.actionTitle}>Movimientos</Text>
          <Text style={styles.actionSubtitle}>Ver historial</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: '#EEEEEE' }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>Informacion de la cuenta</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Telefono</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{phone || ''}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Tipo de cuenta</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>Cuenta de ahorros</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Moneda</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>COP - Peso Colombiano</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Numero de cuenta</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{accountNo}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.primary }]}
        onPress={() => bridge.sendEvent('LOGOUT')}
        activeOpacity={0.7}
      >
        <Text style={[styles.logoutText, { color: theme.primary }]}>Cerrar Sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
  },
  actionIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;