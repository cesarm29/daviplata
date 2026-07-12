import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { BundleProps } from '../types';
import { defaultTheme } from '../theme/colors';
import { api } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingOverlay from '../components/LoadingOverlay';

const LoginScreen: React.FC<BundleProps> = ({ onEvent, theme = defaultTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Formato de correo invalido';
    }

    if (!password) {
      newErrors.password = 'La contrasena es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Minimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await api.login(email, password);
      onEvent?.('LOGIN_SUCCESS', {
        sessionId: result.sessionId,
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Daviplata</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tu billetera digital
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Correo electronico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            theme={theme}
          />

          <Input
            label="Contrasena"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            theme={theme}
          />

          <Button
            title="Iniciar Sesion"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            theme={theme}
          />
        </View>
      </View>

      <LoadingOverlay visible={loading} theme={theme} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
});

export default LoginScreen;
