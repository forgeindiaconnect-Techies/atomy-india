import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AtomyFooter from '../Navigation/AtomyFooter';

export default function GuidePage({
  onNavigateHome,
  onNavigateBack,
  onNavigateMembership,
}) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Breadcrumb Bar */}
      <View style={styles.breadcrumbBar}>
        <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
          <Text style={styles.breadLink}>HOME</Text>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
        <Text style={styles.breadActive}>Guide</Text>
      </View>

      {/* 2. Empty Content Container matching website */}
      <View style={styles.emptyCard}>
        <Ionicons name="book-outline" size={44} color="#94A3B8" style={{ marginBottom: 12 }} />
        <Text style={styles.pageTitle}>User Guide</Text>
        <Text style={styles.emptyText}>No guide contents currently available.</Text>
      </View>

      {/* 3. Footer */}
      <AtomyFooter onNavigateHome={onNavigateHome} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  breadcrumbBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  breadActive: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginVertical: 40,
    paddingVertical: 70,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
