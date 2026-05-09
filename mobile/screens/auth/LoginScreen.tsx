import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export const LoginScreen = () => {
  const { login } = useAuthStore();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Screen</Text>
      <Button title="Login (Demo)" onPress={() => login('test@test.com', 'password')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', gap: 20 },
  text: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' }
});
