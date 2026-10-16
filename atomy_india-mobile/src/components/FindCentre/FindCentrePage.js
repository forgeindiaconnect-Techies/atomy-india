import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ATOMY_CENTRES, ATOMY_STATES } from '../../data/centresData';

const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

export default function FindCentrePage({
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  cartCount = 0,
}) {
  const [selectedState, setSelectedState] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'map' | 'list'
  const [selectedMapCentre, setSelectedMapCentre] = useState(ATOMY_CENTRES[0]);

  const filteredCentres = useMemo(() => {
    return ATOMY_CENTRES.filter((c) => {
      if (selectedState !== 'All States' && c.state !== selectedState) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = c.name?.toLowerCase().includes(q);
        const inCity = c.city?.toLowerCase().includes(q);
        const inAddr = c.address?.toLowerCase().includes(q);
        const inLeader = c.leader?.toLowerCase().includes(q);
        if (!inName && !inCity && !inAddr && !inLeader) return false;
      }
      return true;
    });
  }, [selectedState, searchQuery]);

  const handleCall = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Call Centre', `Phone: ${phone}`);
    });
  };

  const handleWhatsApp = (whatsapp, name) => {
    if (!whatsapp) return;
    const text = encodeURIComponent(`Hello, I am inquiring about Atomy Centre: ${name}`);
    const url = `https://wa.me/${whatsapp}?text=${text}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', `Chat: +${whatsapp}`);
    });
  };

  const handleOpenGoogleMaps = (centre) => {
    if (!centre) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${centre.lat},${centre.lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Google Maps', `Coordinates: ${centre.lat}, ${centre.lng}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP CYAN NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack || onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandingCenter}>
          <Image source={phoenixLogo} style={styles.phoenixEmblem} resizeMode="contain" />
          <View style={styles.brandingTextCol}>
            <Text style={styles.brandingTitle} numberOfLines={1}>
              FIND CENTRE
            </Text>
            <Text style={styles.brandingSubtitle}>Education & Delivery Centres</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={onCartPress}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Corporate Support & Headquarters Info (Matching Website Contact Centre) */}
      <View style={styles.corporateHqCard}>
        <View style={styles.hqHeaderRow}>
          <Ionicons name="business" size={16} color="#00A3E0" />
          <Text style={styles.hqTitle}>Atomy Enterprise India Headquarters</Text>
        </View>
        <Text style={styles.hqAddressText}>
          801, 8th Floor, Tower B, Unitech Cyber Park, Sector 39, Gurugram, Haryana - 122003
        </Text>
        <View style={styles.hqContactRow}>
          <TouchableOpacity
            style={styles.hqCallBtn}
            onPress={() => Linking.openURL('tel:18001035555')}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={13} color="#00A3E0" />
            <Text style={styles.hqCallBtnText}>Toll-Free: 1800-103-5555</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.hqCallBtn}
            onPress={() => Linking.openURL('mailto:atomy_in@atomypark.com')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={13} color="#00A3E0" />
            <Text style={styles.hqCallBtnText}>atomy_in@atomypark.com</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. REAL INTERACTIVE LEAFLET / OPENSTREETMAP MAP (Immediately visible at top) */}
        <View style={styles.mapSectionWrapper}>
          <View style={styles.mapSectionHeader}>
            <View style={styles.mapHeaderLeft}>
              <Ionicons name="map" size={18} color="#00A3E0" />
              <Text style={styles.mapSectionTitle}>Interactive Centre Map</Text>
            </View>
            {selectedMapCentre && (
              <TouchableOpacity
                style={styles.googleMapsNavBtn}
                onPress={() => handleOpenGoogleMaps(selectedMapCentre)}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={13} color="#FFFFFF" />
                <Text style={styles.googleMapsNavBtnText}>Open Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Real Live OpenStreetMap Frame on Web / Visual GPS Map on Mobile */}
          <View style={styles.mapCanvas}>
            {Platform.OS === 'web' ? (
              <iframe
                title="Atomy India Education Centre Live Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedMapCentre?.lng || 78) - 4}%2C${(selectedMapCentre?.lat || 22) - 3}%2C${(selectedMapCentre?.lng || 78) + 4}%2C${(selectedMapCentre?.lat || 22) + 3}&layer=mapnik&marker=${selectedMapCentre?.lat || 22.59}%2C${selectedMapCentre?.lng || 78.96}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <>
                <View style={styles.compassIndicator}>
                  <Ionicons name="compass-outline" size={18} color="#0284C7" />
                  <Text style={styles.compassText}>N</Text>
                </View>
                <Text style={styles.mapRegionWatermark}>INDIA</Text>
                <Text style={styles.mapPinHelpText}>Tap pins to view centre details</Text>

                {filteredCentres.map((c) => {
                  const isSelected = selectedMapCentre?.id === c.id;
                  const left = Math.max(6, Math.min(88, ((c.lng - 68) / (95 - 68)) * 100));
                  const top = Math.max(6, Math.min(88, ((35 - c.lat) / (35 - 8)) * 100));

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.mapPinTouch,
                        { left: `${left}%`, top: `${top}%` },
                        isSelected && styles.mapPinTouchSelected,
                      ]}
                      onPress={() => setSelectedMapCentre(c)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.mapPinCircle, isSelected && styles.mapPinCircleSelected]}>
                        <Ionicons
                          name="location"
                          size={isSelected ? 18 : 12}
                          color={isSelected ? '#00A3E0' : '#E11D48'}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>

          {/* Selected Centre Spotlight Card Attached to Map */}
          {selectedMapCentre && (
            <View style={styles.selectedMapCentreCard}>
              <View style={styles.selectedMapHeaderRow}>
                <View style={styles.selectedMapIconWrap}>
                  <Ionicons name="business" size={16} color="#00A3E0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedMapName} numberOfLines={1}>
                    {selectedMapCentre.name}
                  </Text>
                  <Text style={styles.selectedMapSub}>
                    {selectedMapCentre.city}, {selectedMapCentre.state}
                  </Text>
                </View>
                <View style={styles.coordBadge}>
                  <Text style={styles.coordBadgeText}>
                    {selectedMapCentre.lat?.toFixed(2)}°, {selectedMapCentre.lng?.toFixed(2)}°
                  </Text>
                </View>
              </View>

              <Text style={styles.selectedMapAddr} numberOfLines={2}>
                {selectedMapCentre.address}
              </Text>

              <View style={styles.selectedMapActionsRow}>
                <TouchableOpacity
                  style={styles.mapActionNavBtn}
                  onPress={() => handleOpenGoogleMaps(selectedMapCentre)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.mapActionNavBtnText}>Live Navigation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapActionCallBtn}
                  onPress={() => handleCall(selectedMapCentre.phone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={14} color="#00A3E0" />
                  <Text style={styles.mapActionCallBtnText}>Call</Text>
                </TouchableOpacity>

                {selectedMapCentre.whatsapp && (
                  <TouchableOpacity
                    style={styles.mapActionWaBtn}
                    onPress={() => handleWhatsApp(selectedMapCentre.whatsapp, selectedMapCentre.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
                    <Text style={styles.mapActionWaBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 3. SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search centre, city, pin code or leader..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4. STATE HORIZONTAL FILTER CHIPS */}
        <View style={styles.stateFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stateScrollContent}
          >
            {ATOMY_STATES.map((st) => {
              const isSelected = selectedState === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.stateChip, isSelected && styles.stateChipActive]}
                  onPress={() => {
                    setSelectedState(st);
                    const found = ATOMY_CENTRES.find(c => st === 'All States' || c.state === st);
                    if (found) setSelectedMapCentre(found);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.stateChipText, isSelected && styles.stateChipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. RESULTS COUNT BAR */}
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={styles.countBold}>{filteredCentres.length}</Text> Official Centres
            {selectedState !== 'All States' ? ` in ${selectedState}` : ' Across India'}
          </Text>
        </View>

        {/* 6. LIST OF CENTRES */}
        {filteredCentres.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Education Centres Found</Text>
              <Text style={styles.emptySub}>
                Try searching with another keyword or select "All States".
              </Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedState('All States');
                  setSearchQuery('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetFilterText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCentres.map((centre) => (
              <View key={centre.id} style={styles.centreCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.centreIconBadge}>
                  <Ionicons name="business" size={18} color="#00A3E0" />
                </View>
                <View style={styles.cardHeaderTitleCol}>
                  <Text style={styles.centreName}>{centre.name}</Text>
                  <View style={styles.stateTagRow}>
                    <Text style={styles.cityTag}>{centre.city}</Text>
                    <Text style={styles.stateTag}>{centre.state}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Address */}
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.addressText}>{centre.address}</Text>
              </View>

              {/* Leader */}
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.leaderText}>
                  Center Leader: <Text style={styles.leaderName}>{centre.leader}</Text>
                </Text>
              </View>

              {/* Hours */}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.hoursText}>{centre.hours}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(centre.phone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={15} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>Call: {centre.phone}</Text>
                </TouchableOpacity>

                {centre.whatsapp && (
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsApp(centre.whatsapp, centre.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                    <Text style={styles.whatsappButtonText}>Chat</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => {
                    setSelectedMapCentre(centre);
                    handleOpenGoogleMaps(centre);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate-circle-outline" size={16} color="#00A3E0" />
                  <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 10 : 12,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  brandingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 8,
  },
  phoenixEmblem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  brandingTextCol: {
    flexShrink: 1,
  },
  brandingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  stateFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  stateScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stateChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  stateChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  stateChipTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  resultsCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  resultsCountText: {
    fontSize: 13,
    color: '#64748B',
  },
  countBold: {
    fontWeight: '700',
    color: '#00A3E0',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    gap: 12,
  },
  centreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  centreIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitleCol: {
    flex: 1,
  },
  centreName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4,
  },
  stateTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A3E0',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stateTag: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  leaderText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },
  leaderName: {
    fontWeight: '600',
    color: '#1E293B',
  },
  hoursText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  corporateHqCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 4,
  },
  hqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hqTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hqAddressText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  hqContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  hqCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hqCallBtnText: {
    color: '#00A3E0',
    fontSize: 11,
    fontWeight: '700',
  },
  // View Mode Toggle
  viewModeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  viewModeBtnActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#0284C7',
  },
  viewModeBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  viewModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Interactive Map Section
  mapSectionWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  googleMapsNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  googleMapsNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapCanvas: {
    height: 240,
    backgroundColor: '#E0F2FE',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  compassIndicator: {
    position: 'absolute',
    top: 8,
    right: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  compassText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  mapRegionWatermark: {
    position: 'absolute',
    top: '38%',
    left: '32%',
    fontSize: 34,
    fontWeight: '900',
    color: 'rgba(2, 132, 199, 0.12)',
    letterSpacing: 4,
  },
  mapPinHelpText: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapPinTouch: {
    position: 'absolute',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  mapPinTouchSelected: {
    zIndex: 10,
  },
  mapPinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  mapPinCircleSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderColor: '#00A3E0',
    borderWidth: 2,
  },
  selectedMapCentreCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 6,
  },
  selectedMapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedMapIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMapName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedMapSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  coordBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  selectedMapAddr: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  selectedMapActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  mapActionNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  mapActionNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  mapActionCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapActionCallBtnText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '700',
  },
  mapActionWaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapActionWaBtnText: {
    color: '#16A34A',
    fontSize: 11.5,
    fontWeight: '700',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#00A3E0',
    fontSize: 12,
    fontWeight: '700',
  },
});
