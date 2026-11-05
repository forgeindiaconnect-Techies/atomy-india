import React, { useState, useEffect } from 'react';
import { Truck, X, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
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
    order?.pickupNote || 'Verified Customer at Hub Counter'
  );

  const [trackingNumber, setTrackingNumber] = useState(
    order?.tracking?.trackingNumber || order?.trackingNumber || (isPickup ? `PICKUP-${order?.orderId || order?.id || 'COUNTER'}` : '')
  );
  const resolveStatus = (ord) => {
    return ord?.orderStatus || ord?.status || ord?.tracking?.currentStatus || 'PLACED';
  };

  const [currentStatus, setCurrentStatus] = useState(() => resolveStatus(order));

  useEffect(() => {
    if (order) {
      setCurrentStatus(resolveStatus(order));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isPickup && !trackingNumber.trim()) {
      setErrorMsg('Please provide a valid AWB / Tracking number.');
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

      // Close modal immediately and invoke callback so UI never hangs
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
    <div className="modal-backdrop-overlay" onClick={onClose}>
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
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Building2 size={22} color="#16a34a" />
              <div>
                <strong style={{ color: '#15803d', fontSize: '13px' }}>Customer Self-Pickup Order</strong>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  The customer will arrive at your hub counter in person to collect this order. Verify Order ID at counter and update the status as you pack and hand over.
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
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
              <div className="modal-form-group" style={{ marginBottom: '18px', marginTop: '14px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Hub Pickup Fulfillment Stage</span>
                  <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 'bold' }}>
                    Direct Counter Collection Flow
                  </span>
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
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
                  <option value="DELIVERED">Stage 4: DELIVERED / COLLECTED (Handed Over to Customer)</option>
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
                    placeholder="e.g. Verified by Order ID / ID proof at counter"
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
                    background: '#f0f9ff',
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
            <button type="submit" className="atomy-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isPickup ? 'Save Pickup Status' : 'Save Logistics')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
