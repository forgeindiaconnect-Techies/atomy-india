import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import locationService, {
  getShortLocationLabel,
  detectCustomerLiveLocation,
  applyDetectedLocation,
  lookupPostalPincode,
  addLocationListener,
} from '../../services/locationService';
import storageService from '../../services/storageService';
import { fetchHubDetails } from '../../services/api';

const QUICK_AREAS = [
  { pincode: '635002', area: 'Krishnagiri', hub: 'Selva Regional Hub (2-Day SLA)' },
  { pincode: '635202', area: 'Dharmapuri', hub: 'Krishnapuram Hub (2-Day SLA)' },
  { pincode: '635109', area: 'Hosur', hub: 'Hosur Logistics Point' },
  { pincode: '560001', area: 'Bengaluru', hub: 'Karnataka Regional Center' },
  { pincode: '600001', area: 'Chennai', hub: 'Chennai Central Fulfillment' },
  { pincode: '110001', area: 'New Delhi', hub: 'Delhi NCR Hub' },
];

export default function DeliveryLocationBar({ onLocationChange }) {
  const [pincode, setPincode] = useState(() => storageService.getDeliveryPincode() || '635002');
  const [city, setCity] = useState(() => storageService.getDeliveryCity() || 'Krishnagiri');
  const [hubDetails, setHubDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Sync state on mount and listen to broadcasted location changes
  useEffect(() => {
    const initialPin = storageService.getDeliveryPincode() || '635002';
    const initialCity = storageService.getDeliveryCity() || 'Krishnagiri';
    setPincode(initialPin);
    setCity(initialCity);

    // Initial hub lookup
    fetchHubDetails(initialPin).then((hub) => {
      if (hub) setHubDetails(hub);
    });

    // Auto-detect live location on initial mount in background
    detectCustomerLiveLocation({ force: false }).then((loc) => {
      if (loc && loc.pincode) {
        setPincode(loc.pincode);
        setCity(loc.city || 'Krishnagiri');
      }
    });

    const unsubscribe = addLocationListener((data) => {
      if (data?.pincode) {
        setPincode(data.pincode);
        setCity(data.city || 'Krishnagiri');
        if (data.hubDetails) setHubDetails(data.hubDetails);
        if (onLocationChange) onLocationChange(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Detect Live GPS Location
  const handleDetectLiveLocation = async () => {
    setIsDetecting(true);
    setLookupError('');
    setStatusMessage('Acquiring live GPS location...');

    try {
      const loc = await detectCustomerLiveLocation({ force: true });
      if (loc && loc.pincode) {
        setPincode(loc.pincode);
        setCity(loc.city || 'Krishnagiri');
        const hub = await fetchHubDetails(loc.pincode);
        if (hub) setHubDetails(hub);
        setStatusMessage(`✓ Connected to ${loc.city || 'Area'} (${loc.pincode})`);
        setTimeout(() => {
          setStatusMessage('');
          setIsModalOpen(false);
        }, 1200);
      } else {
        setLookupError('Could not detect exact location. Please enter your 6-digit PIN.');
      }
    } catch (err) {
      setLookupError('Location access failed. Please enter your 6-digit PIN.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Apply PIN code from input or quick select chip
  const handleApplyPincode = async (targetPin) => {
    const clean = String(targetPin || inputPin || '').trim();
    if (!/^\d{6}$/.test(clean)) {
      setLookupError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsDetecting(true);
    setLookupError('');
    setStatusMessage('Resolving postal area and regional hub...');

    try {
      const postal = await lookupPostalPincode(clean);
      const chosenCity = postal?.areaName || 'Krishnagiri';
      const chosenState = postal?.state || 'Tamil Nadu';

      const res = await applyDetectedLocation({
        pincode: clean,
        city: chosenCity,
        state: chosenState,
        method: 'manual',
      });

      setPincode(clean);
      setCity(chosenCity);
      if (res?.hubDetails) setHubDetails(res.hubDetails);

      setStatusMessage(`✓ Connected to ${chosenCity} (${clean})`);
      setTimeout(() => {
        setStatusMessage('');
        setIsModalOpen(false);
        setInputPin('');
      }, 1000);
    } catch (err) {
      setLookupError('Failed to resolve PIN code. Using regional fallback.');
    } finally {
      setIsDetecting(false);
    }
  };

  const shortLabel = getShortLocationLabel(pincode, city);

  return (
    <>
      {/* Authentic Mobile Location Bar: 
          "Current Area: Krishnagiri (635002)    Change ˅" */}
      <TouchableOpacity
        style={styles.locationStrip}
        activeOpacity={0.8}
        onPress={() => setIsModalOpen(true)}
      >
        <View style={styles.stripLeft}>
          <Ionicons name="location-sharp" size={14} color="#00a3e0" style={styles.stripIcon} />
          <Text style={styles.stripText} numberOfLines={1}>
            <Text style={styles.stripLabel}>Current Area: </Text>
            <Text style={styles.stripLocationBold}>{shortLabel}</Text>
          </Text>
        </View>

        <View style={styles.stripRight}>
          <Text style={styles.changeText}>Change</Text>
          <Ionicons name="chevron-down" size={13} color="#0284c7" />
        </View>
      </TouchableOpacity>

      {/* Location & Hub Selector Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="location" size={18} color="#00a3e0" />
                <Text style={styles.modalTitle}>Choose Current Delivery Area</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.modalSubtitle}>
                Select your area to connect to the nearest Atomy India Regional Logistics Hub for 2-Day SLA delivery and authentic distributor wholesale pricing.
              </Text>

              {/* 1. Live GPS Location Button */}
              <TouchableOpacity
                style={[styles.detectBtn, isDetecting && styles.detectBtnDisabled]}
                activeOpacity={0.85}
                disabled={isDetecting}
                onPress={handleDetectLiveLocation}
              >
                {isDetecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="navigate-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.detectBtnText}>
                  {isDetecting ? 'Detecting Live Location...' : 'Use Current Live Location (GPS)'}
                </Text>
              </TouchableOpacity>

              {/* Feedback / Status */}
              {statusMessage ? (
                <View style={styles.statusBox}>
                  <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                  <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
              ) : null}

              {lookupError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={15} color="#dc2626" />
                  <Text style={styles.errorText}>{lookupError}</Text>
                </View>
              ) : null}

              {/* 2. Manual PIN Code Input */}
              <View style={styles.pinInputSection}>
                <Text style={styles.inputLabel}>Or Enter 6-Digit PIN Code</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.pinInput}
                    placeholder="e.g. 635002"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={inputPin}
                    onChangeText={(txt) => {
                      setInputPin(txt.replace(/\D/g, ''));
                      setLookupError('');
                    }}
                  />
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => handleApplyPincode()}
                    disabled={isDetecting || inputPin.length !== 6}
                  >
                    <Text style={[styles.applyBtnText, inputPin.length === 6 && styles.applyBtnTextActive]}>
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 3. Quick Select Hub Areas */}
              <View style={styles.quickSection}>
                <Text style={styles.quickTitle}>Popular Hub Areas</Text>
                <View style={styles.chipsRow}>
                  {QUICK_AREAS.map((item) => {
                    const isSelected = pincode === item.pincode;
                    return (
                      <TouchableOpacity
                        key={item.pincode}
                        style={[styles.areaChip, isSelected && styles.areaChipSelected]}
                        activeOpacity={0.7}
                        onPress={() => handleApplyPincode(item.pincode)}
                      >
                        <Text style={[styles.areaChipText, isSelected && styles.areaChipTextSelected]}>
                          {item.area} ({item.pincode})
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={13} color="#00a3e0" style={{ marginLeft: 4 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. Active Regional Hub Card */}
              <View style={styles.hubInfoCard}>
                <View style={styles.hubHeaderRow}>
                  <View style={styles.hubStatusDot} />
                  <Text style={styles.hubBadgeText}>CONNECTED REGIONAL LOGISTICS HUB</Text>
                </View>
                <Text style={styles.hubNameText}>
                  {hubDetails?.hubName || (pincode === '635002' ? 'Selva Regional Logistics Hub' : 'Regional Logistics Hub')}
                </Text>
                <Text style={styles.hubAddressText}>
                  📍 {hubDetails?.hubAddress || 'RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002'}
                </Text>
                <View style={styles.hubMetaRow}>
                  <Text style={styles.hubMetaItem}>
                    👤 Manager: <Text style={styles.hubMetaBold}>{hubDetails?.contactPerson || 'Selva Kumar'}</Text>
                  </Text>
                  <Text style={styles.hubMetaItem}>
                    ⚡ SLA: <Text style={styles.hubMetaBold}>2-Day SLA (Nearby Hub)</Text>
                  </Text>
                </View>
                {hubDetails?.coManagerName && (
                  <View style={styles.coManagerRow}>
                    <Ionicons name="shield-checkmark" size={12} color="#0284c7" />
                    <Text style={styles.coManagerText}>
                      Standby Hub Co-Manager: <Text style={styles.hubMetaBold}>{hubDetails.coManagerName}</Text>
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  locationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  stripIcon: {
    marginRight: 6,
  },
  stripText: {
    fontSize: 12,
    color: '#334155',
  },
  stripLabel: {
    color: '#0369a1',
    fontWeight: '500',
  },
  stripLocationBold: {
    color: '#0284c7',
    fontWeight: '700',
  },
  stripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 6,
  },
  changeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284c7',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    marginBottom: 14,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00a3e0',
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#00a3e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  detectBtnDisabled: {
    backgroundColor: '#7dd3fc',
  },
  detectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
  },
  pinInputSection: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  applyBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  applyBtnTextActive: {
    color: '#00a3e0',
  },
  quickSection: {
    marginBottom: 16,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  areaChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#38BDF8',
  },
  areaChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  areaChipTextSelected: {
    color: '#0369A1',
  },
  hubInfoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  hubStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  hubBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  hubNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  hubAddressText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  hubMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  hubMetaItem: {
    fontSize: 11,
    color: '#475569',
  },
  hubMetaBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  coManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  coManagerText: {
    fontSize: 11,
    color: '#0369A1',
  },
});

