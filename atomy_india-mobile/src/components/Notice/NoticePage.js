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

export default function NoticePage({
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  cartCount = 0,
}) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Page Header Title & Breadcrumb */}
      <View style={styles.titleSection}>
        <Text style={styles.pageMainTitle}>Notice</Text>
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
            <Text style={styles.breadLink}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.breadSep}>&gt;</Text>
          <Text style={styles.breadActive}>Notice</Text>
        </View>
      </View>

      {/* 2. Empty Content Container matching website */}
      <View style={styles.emptyCard}>
        <Ionicons name="newspaper-outline" size={44} color="#94A3B8" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyText}>No notices currently published.</Text>
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
  titleSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadLink: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  breadSep: {
    fontSize: 12,
    color: '#94A3B8',
  },
  breadActive: {
    fontSize: 13,
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
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
