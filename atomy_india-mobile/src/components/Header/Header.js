import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { SUB_NAV_LINKS } from '../../data/mockData';

// Authentic logos
const ficLogo = require('../../../assets/fic-symbol.png');
const phoenixLogo = require('../../../assets/fic-symbol.png');

const SUB_NAV_ICONS = {
  home: 'home-outline',
  about: 'business-outline',
  notices: 'megaphone-outline',
  compensation: 'ribbon-outline',
  guide: 'book-outline',
  seminars: 'videocam-outline',
  hub: 'globe-outline',
};

export default function Header({
  cartCount = 0,
  onCartPress,
  onSearchSubmit,
  onSearchPress,
  activeSubTab = 'home',
  onSelectSubTab,
  onLogoPress,
  onDropdownMenuPress,
  onOpenRecentlyViewed,
  recentlyViewedCount = 0,
  isMember = false,
  onMemberBadgePress,
}) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const handleSearch = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* 1. Top Header Row: Solid Atomy Cyan Blue Background */}
      <View style={styles.topBlueRow}>
        {/* Left Side: Forge India Connect Branding */}
        <TouchableOpacity
          style={styles.brandContainer}
          activeOpacity={0.8}
          onPress={onLogoPress}
        >
          <Image
            source={ficLogo}
            style={styles.ficLogoImg}
            resizeMode="contain"
          />
          <View style={styles.ficBrandCol}>
            <View style={styles.ficTitleRow}>
              <Text style={styles.ficForgeText}>FORGE </Text>
              <Text style={styles.ficIndiaText}>INDIA</Text>
            </View>
            <View style={styles.ficSubRow}>
              <Text style={styles.ficConnectText}>CONNECT</Text>
              {isMember && (
                <View style={styles.headerMemberPill}>
                  <Ionicons name="star" size={9} color="#FFD700" />
                  <Text style={styles.headerMemberPillText}>MEMBER</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Right Side: White Capsule Search Pill + White Cart with Red Badge */}
        <View style={styles.rightActions}>
          {isSearchExpanded ? (
            <View style={styles.expandedSearchBox}>
              <TextInput
                style={styles.expandedSearchInput}
                placeholder="Search..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  if (searchQuery.length > 0) {
                    setSearchQuery('');
                  } else {
                    setIsSearchExpanded(false);
                  }
                }}
                style={styles.searchClearBtn}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            /* White Capsule Search Pill matching user's reference image */
            <TouchableOpacity
              style={styles.searchCapsulePill}
              activeOpacity={0.8}
              onPress={() => {
                if (onSearchPress) {
                  onSearchPress();
                } else {
                  setIsSearchExpanded(true);
                }
              }}
              accessibilityLabel="Search"
            >
              <Ionicons name="search" size={17} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {/* White Cart Outline Icon with Red Circle Badge */}
          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.7}
            onPress={onCartPress}
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="cart-outline" size={25} color="#FFFFFF" />
            <View style={styles.cartRedBadge}>
              <Text style={styles.cartRedBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Header Bar: White Background with Navigation Links + Right Box Button */}
      <View style={styles.subNavBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subNavBarContent}
        >
          {SUB_NAV_LINKS.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.subNavItem}
                activeOpacity={0.7}
                onPress={() => onSelectSubTab && onSelectSubTab(item.id)}
              >
                <Text
                  style={[
                    styles.subNavItemText,
                    isActive && styles.subNavItemTextActive,
                  ]}
                >
                  {item.id === 'home' ? 'HOME' : item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>


        {/* Right Side Dropdown Box Button matching reference image */}
        <TouchableOpacity
          style={[
            styles.subBarDropdownBtn,
            isNavMenuOpen && styles.subBarDropdownBtnActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setIsNavMenuOpen(!isNavMenuOpen)}
          accessibilityLabel="Toggle navigation menu"
        >
          <Ionicons
            name={isNavMenuOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isNavMenuOpen ? COLORS.primary : '#0F172A'}
          />
        </TouchableOpacity>
      </View>

      {/* Clear Pop-up in the Right Half showing only the sub-navigation buttons */}
      <Modal
        visible={isNavMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNavMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.popupModalOverlay}
          activeOpacity={1}
          onPress={() => setIsNavMenuOpen(false)}
        >
          <View
            style={styles.navMenuCard}
            onStartShouldSetResponder={() => true}
          >
            {/* Pop-up Card Header */}
            <View style={styles.navMenuHeaderRow}>
              <View style={styles.navMenuHeaderLeft}>
                <Ionicons name="apps-outline" size={15} color={COLORS.primary} />
                <Text style={styles.navMenuHeaderTitle}>NAVIGATION MENU</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsNavMenuOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* List of only those buttons */}
            <View style={styles.navMenuList}>
              {SUB_NAV_LINKS.map((item, index) => {
                const isActive = activeSubTab === item.id;
                const iconName = SUB_NAV_ICONS[item.id] || 'compass-outline';

                return (
                  <TouchableOpacity
                    key={`sub-popup-${item.id}`}
                    style={[
                      styles.navMenuItemBtn,
                      isActive && styles.navMenuItemBtnActive,
                      index === SUB_NAV_LINKS.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsNavMenuOpen(false);
                      if (onSelectSubTab) {
                        onSelectSubTab(item.id);
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.navMenuIconCircle,
                        isActive && styles.navMenuIconCircleActive,
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={15}
                        color={isActive ? COLORS.primary : '#475569'}
                      />
                    </View>

                    <Text
                      style={[
                        styles.navMenuItemText,
                        isActive && styles.navMenuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.id === 'home' ? 'HOME' : item.label}
                    </Text>

                    {isActive ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={COLORS.primary}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={13}
                        color="#CBD5E1"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 6 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  topBlueRow: {
    backgroundColor: COLORS.primary, // Atomy Cyan Blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8, // Flush to the left corner edge
    paddingRight: 12,
    paddingBottom: 12,
    paddingTop: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ficLogoImg: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  ficBrandCol: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 3,
  },
  ficTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ficForgeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ficIndiaText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 0.5,
  },
  ficConnectText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 2.8,
    marginTop: 1,
  },
  ficSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerMemberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 3,
  },
  headerMemberPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 0.6,
  },
  atomyLogoImg: {
    width: 68,
    height: 26,
  },
  dropdownCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoenixGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 3,
  },
  phoenixEmblem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  phoenixTextCol: {
    flexDirection: 'column',
  },
  phoenixTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  phoenixSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E0F2FE',
    lineHeight: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchCapsulePill: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 32,
    width: 135,
  },
  expandedSearchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 2,
  },
  cartBtn: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cartRedBadge: {
    position: 'absolute',
    top: -4,
    right: -7,
    backgroundColor: '#EF4444', // Bright red badge from screenshot
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartRedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  subNavBarWrapper: {
    backgroundColor: '#FFFFFF', // Pure white bar background
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 3,
  },
  subNavBarContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 12,
  },
  subNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  subNavItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: -0.2,
  },
  subNavItemTextActive: {
    color: COLORS.primary, // #00A3E0 Cyan Blue
    fontWeight: '900',
  },
  subBarDropdownBtn: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1', // Rounded gray box matching reference image
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginLeft: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subBarDropdownBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  subBarRecentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Bright black
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1.2,
    borderColor: '#334155', // Sleek contrasting border
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  subBarRecentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subBarRecentBadge: {
    backgroundColor: '#00A3E0', // Cyan highlight
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  subBarRecentBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  popupModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  navMenuCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 104 : 96,
    right: 12,
    width: 224,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: -2, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
  },
  navMenuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navMenuHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navMenuHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  navMenuList: {
    paddingVertical: 2,
  },
  navMenuItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  navMenuItemBtnActive: {
    backgroundColor: '#F0F9FF',
  },
  navMenuIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navMenuIconCircleActive: {
    backgroundColor: '#E0F2FE',
  },
  navMenuItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  navMenuItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
