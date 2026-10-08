import React, { useState, useEffect } from 'react';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { getCustomerOrderTracking } from '../../services/api';
import './TrackingModal.css';

export default function TrackingModal({ isOpen, onClose, initialOrderId = '' }) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      fetchTracking(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const fetchTracking = async (idToSearch) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerOrderTracking(idToSearch.trim());
      setTrackingData(res.data);
    } catch (err) {
      setTrackingData(null);
      setError(err.message || 'Order tracking not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderIdInput);
  };

  const checkpoints = trackingData?.checkpoints ? JSON.parse(trackingData.checkpoints) : [];

  return (
    <div className="tracking-overlay" onClick={onClose}>
      <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-header">
          <div className="tracking-header-title">
            <Truck size={20} color="#00A3E0" />
            <span>Track Order & Delivery Status</span>
          </div>
          <button className="tracking-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="tracking-body">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="tracking-search-bar">
            <input
              type="text"
              placeholder="Enter your Order Number (e.g. ORD-202610...)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="tracking-input"
            />
            <button type="submit" disabled={loading} className="tracking-search-btn">
              <Search size={16} />
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="tracking-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {trackingData && (
            <div className="tracking-result-card">
              {/* Top Summary Card */}
              <div className="tracking-summary-grid">
                <div className="track-summary-box">
                  <span className="summary-label">Order Number</span>
                  <span className="summary-val mono">{trackingData.orderId}</span>
                </div>
                <div className="track-summary-box">
                  <span className="summary-label">Courier Partner</span>
                  <span className="summary-val">{trackingData.courierPartner || 'Assigned Logistics'}</span>
                </div>
                <div className="track-summary-box">
                  <span className="summary-label">AWB / Tracking Number</span>
                  <span className="summary-val mono">{trackingData.trackingNumber || 'Pending AWB'}</span>
                </div>
                <div className="track-summary-box">
                  <span className="summary-label">Estimated Delivery</span>
                  <span className="summary-val highlight">{trackingData.estimatedDelivery || '2-4 Business Days'}</span>
                </div>
              </div>

              {/* Current Status Pill Banner */}
              <div className="track-status-banner">
                <div className="status-badge-live">
                  <span className="pulse-dot"></span>
                  <span>Current Status: <strong>{trackingData.currentStatus}</strong></span>
                </div>
                {trackingData.currentLocation && (
                  <div className="current-loc-badge">
                    <MapPin size={15} />
                    <span>{trackingData.currentLocation}</span>
                  </div>
                )}
              </div>

              {/* Progress Checkpoints Timeline */}
              <div className="timeline-container">
                <h4 className="timeline-title">Shipment Checkpoints Timeline</h4>

                {checkpoints.length === 0 ? (
                  <p className="no-checkpoints-text">Initial order received. Checkpoint updates will appear here once dispatched.</p>
                ) : (
                  <div className="timeline-list">
                    {checkpoints.map((cp, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-marker-col">
                          <div className={`timeline-marker ${idx === checkpoints.length - 1 ? 'latest' : 'completed'}`}>
                            {idx === checkpoints.length - 1 ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                          {idx < checkpoints.length - 1 && <div className="timeline-line"></div>}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-top">
                            <span className="timeline-status">{cp.status.replace(/_/g, ' ')}</span>
                            <span className="timeline-time">{cp.timestamp}</span>
                          </div>
                          {cp.location && <div className="timeline-loc"><MapPin size={12} /> {cp.location}</div>}
                          <p className="timeline-desc">{cp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
