import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BundleProps } from '../types';
import { defaultTheme } from '../theme/colors';
import { api } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import BalanceCard from '../components/BalanceCard';
import LoadingOverlay from '../components/LoadingOverlay';

const TransferScreen: React.FC<BundleProps> = ({ onEvent, userData, theme = defaultTheme }) => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});

  const validate = (): boolean => {
    const newErrors: { phone?: string; amount?: string } = {};

    if (!phone) {
      newErrors.phone = 'El telefono es requerido';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Debe ser un numero de 10 digitos';
    } else if (userData && phone === userData.phone) {
      newErrors.phone = 'No puedes enviar dinero a ti mismo';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'El monto es requerido';
    } else if (amountNum <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (userData && amountNum > userData.balance) {
      newErrors.amount = 'Saldo insuficiente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransfer = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await api.transfer(userData?.id ? '' : '', {
        destinationPhone: phone,
        amount: parseFloat(amount),
        description: description || undefined,
      });
      onEvent?.('TRANSFER_SUCCESS', { transaction: result.transaction });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onEvent?.('BACK', { userData })} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Transferir</Text>
      </View>

      <BalanceCard balance={userData?.balance || 0} theme={theme} />

      <View style={styles.form}>
        <Input
          label="Telefono destino"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
          error={errors.phone}
          theme={theme}
        />

        <Input
          label="Monto"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          error={errors.amount}
          theme={theme}
        />

        <Input
          label="Descripcion (opcional)"
          value={description}
          onChangeText={setDescription}
          theme={theme}
        />

        <Button
          title="Enviar dinero"
          onPress={handleTransfer}
          loading={loading}
          disabled={loading}
          theme={theme}
          style={styles.submitButton}
        />
      </View>

      <LoadingOverlay visible={loading} theme={theme} />
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
    marginBottom: 20,
    marginTop: 16,
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
  form: {
    marginTop: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default TransferScreen;
