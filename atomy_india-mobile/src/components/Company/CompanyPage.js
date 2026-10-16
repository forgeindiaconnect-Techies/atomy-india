import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function CompanyPage({ onNavigateHome, onNavigateBack }) {
  const targetUrl = 'https://global.atomy.com/menu.es?mid=a20101000000';

  useEffect(() => {
    Linking.openURL(targetUrl).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="globe-outline" size={44} color={COLORS.primary} />
        <Text style={styles.title}>Redirecting to Global Atomy...</Text>
        <Text style={styles.subtitle}>
          Opening the official About Atomy portal at:
        </Text>
        <Text style={styles.urlText}>{targetUrl}</Text>

        <TouchableOpacity
          style={styles.openBtn}
          activeOpacity={0.8}
          onPress={() => Linking.openURL(targetUrl)}
        >
          <Text style={styles.openBtnText}>Open in Browser</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={onNavigateBack || onNavigateHome}
        >
          <Text style={styles.backBtnText}>Return to App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 12,
    color: '#38BDF8',
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 10,
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});
