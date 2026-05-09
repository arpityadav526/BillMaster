import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
export const NotificationsScreen = () => <View style={styles.container}><Text style={styles.text}>Notifications Screen</Text></View>;
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }, text: { color: Colors.textPrimary, fontSize: 20 } });
