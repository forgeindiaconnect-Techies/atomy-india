import React, { useState } from 'react';
import { Truck, X, AlertCircle } from 'lucide-react';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import '../Admin/AdminDashboard.css';
import './DistributorTrackingModal.css';

export default function DistributorTrackingModal({ order, distributor, onClose, onUpdateSuccess }) {
  const [courierPartner, setCourierPartner] = useState(
    order?.tracking?.courierPartner || order?.courier || 'Blue Dart Express'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order?.tracking?.trackingNumber || order?.trackingNumber || ''
  );
  const [currentStatus, setCurrentStatus] = useState(
    order?.tracking?.currentStatus || order?.orderStatus || 'PLACED'
  );
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

    if (!trackingNumber.trim()) {
      setErrorMsg('Please provide a valid AWB / Tracking number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        courierPartner: courierPartner.trim(),
        trackingNumber: trackingNumber.trim(),
        currentStatus,
        orderStatus: currentStatus,
        initialLocation: currentLocation.trim(),
        currentLocation: currentLocation.trim(),
        estimatedDelivery: estimatedDelivery.trim()
      };

      await onUpdateSuccess(order.orderId || order.id, payload);
      onClose();
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
            <Truck size={20} color="#00A3E0" />
            <h3>Shipment Tracking: {order?.orderId || order?.id}</h3>
          </div>
          <button className="atomy-modal-close" onClick={onClose} type="button" title="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="atomy-modal-body" style={{ padding: '24px 28px' }}>
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

          {/* Shipping Stage Update */}
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

          <div className="modal-actions-right" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="atomy-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="atomy-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Logistics'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
