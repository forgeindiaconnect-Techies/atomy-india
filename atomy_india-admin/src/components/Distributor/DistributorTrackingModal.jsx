import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  AlertCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  Clock,
  User,
  Phone,
  Check
} from 'lucide-react';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import { sendPickupOtp, verifyPickupOtp } from '../../services/distributorService';
import '../Admin/AdminDashboard.css';
import './DistributorTrackingModal.css';

export default function DistributorTrackingModal({ order, distributor, onClose, onUpdateSuccess }) {
  const [courierPartner, setCourierPartner] = useState(
    order?.tracking?.courierPartner || order?.courier || 'Blue Dart Express'
  );
  const isPickup = Boolean(
    order && (
      order.fulfillmentType === 'STORE_PICKUP' ||
      order.shippingMethod === 'STORE_PICKUP' ||
      order.isPickup === true ||
      (order.pickupStatus && order.pickupStatus !== 'NONE') ||
      (typeof order.shippingAddress === 'string' && order.shippingAddress.toLowerCase().includes('direct store pickup')) ||
      (order.hubName && !order.courier)
    )
  );

  const [verificationNote, setVerificationNote] = useState(
    order?.pickupNote || 'Verified Customer at Hub Counter via OTP'
  );

  const [trackingNumber, setTrackingNumber] = useState(
    order?.tracking?.trackingNumber || order?.trackingNumber || (isPickup ? `PICKUP-${order?.orderId || order?.id || 'COUNTER'}` : '')
  );

  const resolveStatus = (ord) => {
    return ord?.orderStatus || ord?.status || ord?.tracking?.currentStatus || 'PLACED';
  };

  const [currentStatus, setCurrentStatus] = useState(() => resolveStatus(order));

  // OTP State Management for Hub Counter Handover
  const [otpValue, setOtpValue] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [otpErrorMessage, setOtpErrorMessage] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(
    Boolean(
      order?.pickupVerifiedAt ||
      order?.pickupStatus === 'COLLECTED' ||
      resolveStatus(order) === 'DELIVERED'
    )
  );

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (order) {
      const resolved = resolveStatus(order);
      setCurrentStatus(resolved);
      setIsOtpVerified(
        Boolean(
          order?.pickupVerifiedAt ||
          order?.pickupStatus === 'COLLECTED' ||
          resolved === 'DELIVERED'
        )
      );
      if (order?.tracking?.courierPartner || order?.courier) {
        setCourierPartner(order?.tracking?.courierPartner || order?.courier);
      }
      if (order?.tracking?.trackingNumber || order?.trackingNumber) {
        setTrackingNumber(order?.tracking?.trackingNumber || order?.trackingNumber);
      }
      if (order?.tracking?.currentLocation) {
        setCurrentLocation(order.tracking.currentLocation);
      }
      if (order?.estimatedDeliveryDate || order?.estimatedDelivery) {
        setEstimatedDelivery(order.estimatedDeliveryDate || order.estimatedDelivery);
      }
    }
  }, [order?.orderStatus, order?.status, order?.tracking?.currentStatus, order?.orderId, order?.id]);

  const [currentLocation, setCurrentLocation] = useState(
    order?.tracking?.currentLocation || distributor?.hubAddress || (distributor?.city ? `${distributor.city} Hub` : 'Regional Hub Facility')
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order?.estimatedDeliveryDate || order?.estimatedDelivery || 'Within 2 Days (Nearby Hub)'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const courierOptions = [
    'Blue Dart Express',
    'Delhivery Regional Hub',
    'DTDC Express India',
    'India Post Speed Post',
    'Ekart Logistics',
    'Distributor Direct Van Dispatch'
  ];

  // Trigger 6-digit OTP delivery to customer's registered email via Brevo
  const handleSendOtp = async () => {
    setOtpErrorMessage('');
    setOtpSuccessMessage('');
    setIsSendingOtp(true);
    try {
      const orderId = order.orderId || order.id;
      const distId = distributor?.distributorId || distributor?.id || order?.assignedDistributorId;
      const res = await sendPickupOtp(orderId, distId);
      setOtpSent(true);
      setMaskedEmail(res.maskedEmail || order.customerEmail || 'registered email');
      setOtpSuccessMessage(res.message || `OTP sent to ${res.maskedEmail || order.customerEmail}`);
      setOtpCooldown(30); // 30-second cooldown
    } catch (err) {
      setOtpErrorMessage(err.message || 'Failed to send OTP to customer email. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify entered 6-digit OTP code against backend
  const handleVerifyOtp = async () => {
    const cleanOtp = otpValue.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpErrorMessage('Please enter the complete 6-digit OTP provided by customer.');
      return;
    }
    setOtpErrorMessage('');
    setIsVerifyingOtp(true);
    try {
      const orderId = order.orderId || order.id;
      const distId = distributor?.distributorId || distributor?.id || order?.assignedDistributorId;
      const res = await verifyPickupOtp(orderId, cleanOtp, distId);

      setIsOtpVerified(true);
      setCurrentStatus('DELIVERED');
      setOtpSuccessMessage('✅ OTP Verified Successfully! Parcel handover recorded.');

      if (onUpdateSuccess) {
        await onUpdateSuccess(orderId, {
          orderStatus: 'DELIVERED',
          currentStatus: 'DELIVERED',
          pickupStatus: 'COLLECTED',
          pickupVerifiedAt: new Date().toISOString(),
          pickupVerifiedBy: distId,
          ...(res.order || {})
        });
      }
    } catch (err) {
      setOtpErrorMessage(err.message || 'Invalid verification OTP. Please re-check code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isPickup && !trackingNumber.trim()) {
      setErrorMsg('Please provide a valid AWB / Tracking number.');
      return;
    }

    // Anti-False Pickup Enforcement: If marking DELIVERED for pickup, OTP MUST be verified
    if (isPickup && currentStatus === 'DELIVERED' && !isOtpVerified) {
      setErrorMsg('⚠️ Anti-Fraud Protection: Handover requires 6-digit OTP verification! Please verify OTP at counter first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanTracking = isPickup
        ? (trackingNumber.trim() || `PICKUP-${order?.orderId || order?.id || 'HUB'}`)
        : trackingNumber.trim();
      const cleanCourier = isPickup
        ? 'Regional Hub Self-Pickup'
        : courierPartner.trim();

      const payload = {
        courierPartner: cleanCourier,
        trackingNumber: cleanTracking,
        currentStatus,
        orderStatus: currentStatus,
        pickupStatus: currentStatus === 'DELIVERED' ? 'COLLECTED' : currentStatus === 'READY_FOR_PICKUP' ? 'READY_FOR_PICKUP' : 'PENDING_PACKING',
        initialLocation: currentLocation.trim(),
        currentLocation: currentLocation.trim(),
        estimatedDelivery: isPickup ? 'Direct Counter Pickup' : estimatedDelivery.trim(),
        pickupNote: isPickup ? verificationNote.trim() : null
      };

      onClose();
      if (onUpdateSuccess) {
        await onUpdateSuccess(order.orderId || order.id, payload);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update tracking details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay tracking-modal-overlay" onClick={onClose} style={{ zIndex: 10000000 }}>
      <div className="atomy-modal-box wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px', width: '95%' }}>
        <div className="atomy-modal-header">
          <div className="modal-title-cluster">
            {isPickup ? (
              <>
                <Building2 size={22} color="#16a34a" />
                <div>
                  <h3 style={{ color: '#15803d' }}>Hub Self-Pickup Handover: {order?.orderId || order?.id}</h3>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>In-Store Customer Counter Handover</div>
                </div>
              </>
            ) : (
              <>
                <Truck size={20} color="#00A3E0" />
                <h3>Shipment Tracking: {order?.orderId || order?.id}</h3>
              </>
            )}
          </div>
          <button className="atomy-modal-close" onClick={onClose} type="button" title="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="atomy-modal-body" style={{ padding: '24px 28px' }}>
          {isPickup && (
            <div style={{
              padding: '14px 18px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={24} color="#16a34a" />
                <div>
                  <strong style={{ color: '#15803d', fontSize: '13.5px' }}>Hub Store Self-Pickup Order</strong>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    Customer collects parcel directly at your hub counter. Handover requires 6-digit OTP verification.
                  </div>
                </div>
              </div>
              <div style={{
                background: isOtpVerified ? '#dcfce7' : '#fef3c7',
                color: isOtpVerified ? '#166534' : '#92400e',
                border: `1px solid ${isOtpVerified ? '#86efac' : '#fde68a'}`,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {isOtpVerified ? <Check size={13} /> : <ShieldCheck size={13} />}
                {isOtpVerified ? 'OTP VERIFIED & HANDED OVER' : 'OTP HANDOVER PENDING'}
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Contact & Verification Strip for Counter Staff */}
          {isPickup && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <User size={13} color="#0284c7" />
                  {order?.customerName || order?.user?.fullName || order?.shippingName || 'Customer'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Registered Email (For OTP)</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Mail size={13} color="#0284c7" />
                  {order?.customerEmail || 'No email attached'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Phone size={13} color="#0284c7" />
                  {order?.customerPhone || order?.shippingPhone || order?.phone || 'Not provided'}
                </div>
              </div>
            </div>
          )}

          {/* Live Animated Delivery Stepper matching Customer & Super Admin Experience */}
          <DeliveryStatusStepper
            order={{
              ...order,
              orderStatus: currentStatus,
              status: currentStatus,
              courier: courierPartner,
              trackingNumber: trackingNumber,
              tracking: {
                ...(order?.tracking || {}),
                courierPartner: courierPartner,
                trackingNumber: trackingNumber,
                currentStatus: currentStatus,
                currentLocation: currentLocation,
                estimatedDelivery: estimatedDelivery
              }
            }}
          />

          {/* Shipping / Pickup Stage Update */}
          {isPickup ? (
            <>
              {/* Counter Handover Anti-False Pickup OTP Verification Box */}
              <div style={{
                marginTop: '18px',
                marginBottom: '18px',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                background: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderBottom: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#15803d" />
                    <strong style={{ fontSize: '13.5px', color: '#15803d' }}>
                      Counter Handover OTP Verification (Anti-Fraud Security)
                    </strong>
                  </div>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Strict Identity Check
                  </span>
                </div>

                <div style={{ padding: '16px 18px' }}>
                  {isOtpVerified ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '8px',
                      color: '#15803d'
                    }}>
                      <CheckCircle2 size={24} color="#16a34a" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Parcel Handover Confirmed &amp; Delivered</div>
                        <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                          Customer identity successfully verified via 6-digit Brevo OTP. Status is Stage 4: DELIVERED.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '14px' }}>
                        To prevent false counter collection, trigger a secure 6-digit verification code to the customer's registered email (<strong>{order?.customerEmail}</strong>). The customer will verbally provide the code at your desk.
                      </div>

                      {/* Trigger OTP Button or Active OTP Input Row */}
                      {!otpSent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 20px',
                              fontSize: '13.5px',
                              fontWeight: 700,
                              cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                            }}
                          >
                            {isSendingOtp ? (
                              <>
                                <RefreshCw size={15} className="spinner" />
                                Sending OTP via Brevo...
                              </>
                            ) : (
                              <>
                                <KeyRound size={16} />
                                Trigger Customer Handover OTP
                              </>
                            )}
                          </button>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            Customer must be physically present at the counter
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          background: '#f8fafc',
                          border: '1.5px dashed #0284c7',
                          borderRadius: '8px',
                          padding: '14px 18px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={14} />
                            6-digit OTP dispatched to {maskedEmail || order?.customerEmail}. Ask customer for code:
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              value={otpValue}
                              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              autoFocus
                              style={{
                                width: '180px',
                                padding: '10px 14px',
                                fontSize: '18px',
                                letterSpacing: '6px',
                                fontWeight: 800,
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                border: '2px solid #0284c7',
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#0f172a'
                              }}
                            />

                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={isVerifyingOtp || otpValue.trim().length !== 6}
                              style={{
                                background: otpValue.trim().length === 6 ? '#16a34a' : '#94a3b8',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                cursor: (isVerifyingOtp || otpValue.trim().length !== 6) ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {isVerifyingOtp ? (
                                <>
                                  <RefreshCw size={14} className="spinner" />
                                  Verifying OTP...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={16} />
                                  Verify &amp; Confirm Handover
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || otpCooldown > 0}
                              style={{
                                background: '#ffffff',
                                color: otpCooldown > 0 ? '#94a3b8' : '#0284c7',
                                border: `1.5px solid ${otpCooldown > 0 ? '#cbd5e1' : '#0284c7'}`,
                                borderRadius: '8px',
                                padding: '9px 14px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: (isSendingOtp || otpCooldown > 0) ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <RefreshCw size={13} />
                              {otpCooldown > 0 ? `Resend Code (${otpCooldown}s)` : 'Resend OTP'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Live Feedback Messages */}
                      {otpErrorMessage && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={15} />
                          <span>{otpErrorMessage}</span>
                        </div>
                      )}

                      {otpSuccessMessage && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#15803d', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} />
                          <span>{otpSuccessMessage}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fulfillment Stage Selection */}
              <div className="modal-form-group" style={{ marginBottom: '18px', marginTop: '14px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Hub Pickup Fulfillment Stage</span>
                  <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 'bold' }}>
                    Direct Counter Collection Flow
                  </span>
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    if (nextVal === 'DELIVERED' && !isOtpVerified) {
                      setOtpErrorMessage('Handover requires OTP verification! Please verify OTP at counter first.');
                      return;
                    }
                    setCurrentStatus(nextVal);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #16a34a',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PLACED">Stage 1: PLACED (Payment Confirmed)</option>
                  <option value="PROCESSING">Stage 2: PREPARING (Hub Staff Packing Items)</option>
                  <option value="READY_FOR_PICKUP">Stage 3: READY TO PICK UP (Package Waiting at Counter)</option>
                  <option value="DELIVERED" disabled={!isOtpVerified}>
                    Stage 4: DELIVERED / COLLECTED {isOtpVerified ? '(Handed Over)' : '(Requires OTP Verification)'}
                  </option>
                </select>

                {/* Quick Action One-Click Pills for Subadmin */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStatus('READY_FOR_PICKUP')}
                    style={{
                      background: currentStatus === 'READY_FOR_PICKUP' ? '#dcfce7' : '#ffffff',
                      border: '1.5px solid #16a34a',
                      color: '#15803d',
                      fontWeight: 700,
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CheckCircle2 size={13} /> Mark Ready for Pickup
                  </button>
                  {isOtpVerified && (
                    <button
                      type="button"
                      onClick={() => setCurrentStatus('DELIVERED')}
                      style={{
                        background: currentStatus === 'DELIVERED' ? '#dbeafe' : '#ffffff',
                        border: '1.5px solid #0284c7',
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Confirm Customer Handover
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-form-group">
                  <label>Pickup Counter Location</label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="e.g. Regional Hub Counter, Rayakotta Road"
                  />
                </div>
                <div className="modal-form-group">
                  <label>Customer Handover Verification Note</label>
                  <input
                    type="text"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="e.g. Verified by Customer OTP at counter"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="modal-form-group" style={{ marginBottom: '18px', marginTop: '14px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Fulfillment &amp; Delivery Stage</span>
                  <span style={{ fontSize: '11.5px', color: '#00A3E0', fontWeight: 'normal' }}>
                    Select a stage to preview vehicle movement animation
                  </span>
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #00A3E0',
                    background: '#f0fdf4',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PLACED">Stage 1: PLACED (Payment Confirmed)</option>
                  <option value="PROCESSING">Stage 2: PROCESSING (Warehouse Packing)</option>
                  <option value="SHIPPED">Stage 3: SHIPPED (In Transit - Blue Dart Line-haul)</option>
                  <option value="OUT_FOR_DELIVERY">Stage 4: OUT FOR DELIVERY (Delivery Executive on Bike)</option>
                  <option value="DELIVERED">Stage 5: DELIVERED (Package Received)</option>
                </select>
              </div>

              <div className="modal-row-2">
                <div className="modal-form-group">
                  <label>Courier Service Partner</label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    list="dist-courier-list"
                    required
                  />
                  <datalist id="dist-courier-list">
                    {courierOptions.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="modal-form-group">
                  <label>AWB Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD222696173IN"
                    required
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-form-group">
                  <label>Current Location Hub</label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="e.g. Regional Hub, Rayakotta Road"
                  />
                </div>
                <div className="modal-form-group">
                  <label>Estimated Delivery</label>
                  <input
                    type="text"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    placeholder="e.g. Within 2 Days (Nearby Hub)"
                  />
                </div>
              </div>
            </>
          )}

          <div className="modal-actions-right" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="atomy-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="atomy-btn-primary"
              disabled={isSubmitting || (isPickup && currentStatus === 'DELIVERED' && !isOtpVerified)}
            >
              {isSubmitting ? 'Saving...' : (isPickup ? 'Save Pickup Status' : 'Save Logistics')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
