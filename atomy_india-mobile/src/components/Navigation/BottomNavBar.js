import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavBar({
  activeTab = 'home',
  onTabPress,
  favoritesCount = 0,
  recentlyViewedCount = 0,
}) {
  const TABS = [
    {
      id: 'recent',
      label: 'Recently View',
      icon: 'time-outline',
      activeIcon: 'time',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: 'grid-outline',
      activeIcon: 'grid',
    },
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'heart-outline',
      activeIcon: 'heart',
      badge: favoritesCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          // Featured Enlarged Home Button with Orange Circle Background
          if (tab.id === 'home') {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.homeTabItem}
                activeOpacity={0.85}
                onPress={() => onTabPress && onTabPress(tab.id)}
                accessibilityLabel="Home"
              >
                <View style={styles.orangeHomeCircle}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text
                  style={[
                    styles.homeTabLabel,
                    isActive && styles.homeTabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => onTabPress && onTabPress(tab.id)}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? '#000000' : '#0F172A'}
                />
                {tab.badge > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconContainer: {
    position: 'relative',
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#0F172A', // Sleek bright black badge pill
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A', // Bright black for all buttons
    marginTop: 2,
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: '#000000', // Jet black for active button
    fontWeight: '900',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00A3E0', // Cyan indicator dot below active button
    marginTop: 2,
  },

  // Enlarged Orange Circle Home Button Styles
  homeTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.15,
    marginTop: -18,
  },
  orangeHomeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B00', // Vibrant energetic orange
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF', // Crisp white boundary ring
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 6,
    elevation: 8,
  },
  homeTabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A', // Bright black
    marginTop: 2,
    letterSpacing: -0.2,
  },
  homeTabLabelActive: {
    color: '#FF6B00', // Vibrant orange accent when active
    fontWeight: '900',
  },
});
