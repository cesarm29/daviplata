import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Theme } from '../types';
import { defaultTheme } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  theme?: Theme;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, theme = defaultTheme }) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.secondary }]}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default LoadingOverlay;
