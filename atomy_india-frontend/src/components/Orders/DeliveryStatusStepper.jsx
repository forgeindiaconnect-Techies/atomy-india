import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import './DeliveryStatusStepper.css';

function isStorePickupOrder(order) {
  if (!order) return false;
  return Boolean(
    order.fulfillmentType === 'STORE_PICKUP' ||
    order.shippingMethod === 'STORE_PICKUP' ||
    order.isPickup === true ||
    (order.pickupStatus && order.pickupStatus !== 'NONE') ||
    (typeof order.shippingAddress === 'string' && order.shippingAddress.toLowerCase().includes('direct store pickup')) ||
    (order.hubName && !order.courier)
  );
}

// Compute the exact target stage from the order status set by Admin
function computeTargetStage(order) {
  if (!order) return 1;
  const isPickup = isStorePickupOrder(order);
  const raw = (order.pickupStatus || order.orderStatus || order.status || '').toUpperCase().trim();
  if (raw.includes('CANCEL')) return 3; // Terminal cancelled stage

  if (isPickup) {
    if (raw.includes('DELIVER') || raw.includes('COLLECT')) return 4; // Fully collected / Delivered
    if (raw.includes('READY')) return 3; // Ready for pickup
    if (raw.includes('PREPAR') || raw.includes('PROCESS') || raw.includes('PACK')) return 2;
    return 1; // Placed
  }

  if (raw.includes('DELIVERED')) return 5;
  if (raw.includes('OUT') || raw.includes('LOCAL')) return 4;
  if (raw.includes('TRANSIT') || raw.includes('SHIPPED') || raw.includes('DISPATCH')) return 3;
  if (raw.includes('PREPAR') || raw.includes('PROCESS') || raw.includes('PACK')) return 2;
  return 1; // PLACED / Payment Completed
}

export default function DeliveryStatusStepper({ order }) {
  const isCancelled = Boolean(
    order && (
      String(order.status || '').toUpperCase().includes('CANCEL') ||
      String(order.orderStatus || '').toUpperCase().includes('CANCEL')
    )
  );

  // Target stage comes directly from the Admin's update (1 to 5, or 3 for Cancelled)
  const targetStage = computeTargetStage(order);
  const [currentStep, setCurrentStep] = useState(targetStage);

  // Synchronize immediately with live order status changes
  useEffect(() => {
    setCurrentStep(targetStage);
  }, [targetStage, order?.orderStatus, order?.status]);

  const isPickup = isStorePickupOrder(order);
  const isCollected = Boolean(
    isPickup && (
      String(order?.pickupStatus || '').toUpperCase().includes('COLLECT') ||
      String(order?.orderStatus || '').toUpperCase().includes('DELIVER') ||
      String(order?.status || '').toUpperCase().includes('DELIVER') ||
      String(order?.status || '').toUpperCase().includes('COLLECT') ||
      currentStep === 4
    )
  );

  // If order is cancelled, show travelling status from before-state to Cancelled
  const stages = isCancelled ? [
    { num: 1, label: 'Order Placed', sub: 'Payment Confirmed' },
    { num: 2, label: 'Processing & Check', sub: 'Pre-Dispatch Window' },
    { num: 3, label: 'Order Cancelled', sub: '100% Refund Initiated', isTerminalCancelled: true }
  ] : isPickup ? [
    { num: 1, label: 'Order Placed', sub: 'Payment Confirmed' },
    { num: 2, label: 'Preparing', sub: 'Hub Staff Packing' },
    { num: 3, label: 'Ready to Pick Up', sub: 'Available at Hub Counter' },
    { num: 4, label: 'Delivered', sub: 'Handed Over to Customer' }
  ] : [
    { num: 1, label: 'Order Placed', sub: 'Payment Confirmed' },
    { num: 2, label: 'Preparing', sub: 'Warehouse Packed' },
    { num: 3, label: 'In Transit', sub: 'Blue Dart Dispatch' },
    { num: 4, label: 'Out for Delivery', sub: 'Local Hub Hub' },
    { num: 5, label: 'Delivered', sub: 'Package Received' }
  ];

  return (
    <div className={`delivery-stepper-wrapper ${isCancelled ? 'stepper-cancelled-mode' : ''}`}>
      {/* Real Live Shipping Status Header - Synced with Admin */}
      <div className="shipping-status-live-header">
        <div className="status-header-left">
          <span className={`live-status-indicator-dot ${isCancelled ? 'cancelled-dot' : isPickup ? 'pickup-dot' : ''}`} />
          <span className="shipping-live-title">
            {isCancelled ? 'ORDER CANCELLATION & TRANSIT STATUS' : isPickup ? 'DIRECT HUB SELF-PICKUP STATUS' : 'LIVE ORDER SHIPPING STATUS'}
          </span>
          <span className={`shipping-carrier-pill ${isCancelled ? 'carrier-cancelled' : isPickup ? 'carrier-pickup' : ''}`}>
            {isCancelled ? 'Transit Halted' : isPickup ? 'Direct Store Pickup' : (order?.courier || 'Blue Dart Express')}
          </span>
          <span className="shipping-current-step-label">
            Current Stage:{' '}
            <strong className={`stage-highlight ${isCancelled && currentStep === 3 ? 'stage-cancelled-text' : isPickup ? 'stage-pickup-text' : ''}`}>
              {stages[currentStep - 1] ? stages[currentStep - 1].label : 'Order Placed'}
            </strong>
          </span>
        </div>

        <div className="status-header-right">
          {isPickup ? (
            <>
              <span className="tracking-awb-badge" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}>
                Collection Counter: <strong>{order?.hubName || 'Atomy Regional Logistics Hub'}</strong>
              </span>
              <span className="verified-transit-badge" style={{ background: currentStep === 4 ? '#dcfce7' : currentStep === 3 ? '#e0f2fe' : currentStep === 2 ? '#fef3c7' : '#f1f5f9', color: currentStep === 4 ? '#15803d' : currentStep === 3 ? '#0369a1' : currentStep === 2 ? '#b45309' : '#475569' }}>
                {currentStep === 4 ? 'Delivered / Collected' : currentStep === 3 ? 'Ready for Pickup' : currentStep === 2 ? 'Packing in Progress' : 'Order Placed'}
              </span>
            </>
          ) : (
            <>
              <span className="tracking-awb-badge">
                Tracking ID: <strong>{order?.trackingNumber || (order?.orderId ? `BD-${order.orderId}` : 'BD-942817260IN')}</strong>
              </span>
              <span className={`verified-transit-badge ${isCancelled ? 'cancelled-badge-pill' : ''}`}>
                {isCancelled ? '100% Refunded' : 'Express Courier'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stepper Flow with Animated Moving Objects and DOTTED LINES */}
      <div className="delivery-stepper-flow">
        {stages.map((stage, idx) => {
          const isCompleted = currentStep > stage.num;
          const isCurrent = currentStep === stage.num;
          const isPending = currentStep < stage.num;

          return (
            <React.Fragment key={stage.num}>
              {/* Circle Node */}
              <div
                className={`stepper-stage-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''} ${stage.isTerminalCancelled && (isCurrent || isCompleted) ? 'is-cancelled-node' : ''}`}
              >
                <div className={`stage-circle ${stage.isTerminalCancelled && (isCurrent || isCompleted) ? 'cancelled-circle' : ''}`}>
                  {stage.isTerminalCancelled && (isCurrent || isCompleted) ? (
                    <XCircle size={22} className="stage-cancel-icon" />
                  ) : isCompleted ? (
                    <CheckCircle2 size={19} className="stage-check-icon" />
                  ) : (
                    <span className="stage-number">{stage.num}</span>
                  )}
                  {isCurrent && (
                    <div className={`stage-glow-ring ${stage.isTerminalCancelled ? 'cancel-glow' : ''}`} />
                  )}
                </div>

                <div className="stage-text-block">
                  <div className={`stage-title ${stage.isTerminalCancelled && (isCurrent || isCompleted) ? 'cancelled-title' : ''}`}>
                    {stage.label}
                  </div>
                  <div className="stage-subtitle">{stage.sub}</div>
                  {isCurrent && (
                    <span className={`stage-live-badge ${stage.isTerminalCancelled ? 'cancel-badge' : ''}`}>
                      {stage.isTerminalCancelled
                        ? 'CANCELLED & REFUNDED'
                        : stage.num === 5
                        ? 'DELIVERED 🎉'
                        : 'IN PROGRESS'}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting Dotted Line Segment with Moving Object */}
              {idx < stages.length - 1 && (
                <div className={`stepper-connector-track ${currentStep > stage.num ? 'is-completed' : currentStep === stage.num ? 'is-active-track' : ''}`}>
                  {/* Gray Dotted Line Track */}
                  <div className="connector-bg-dots" />

                  {/* Filled Cyan/Green/Red Dotted Line */}
                  <div
                    className="connector-fill-dots-wrap"
                    style={{
                      width: currentStep > stage.num ? '100%' : currentStep === stage.num ? '100%' : '0%'
                    }}
                  >
                    <div className={`connector-fill-dots ${isCancelled && currentStep >= 2 ? 'cancelled-dots-fill' : currentStep === stage.num ? 'is-active-dots' : ''}`} />
                  </div>

                  {/* ========================================================
                      OBJECT 1: MESSAGE ENVELOPE (Stage 1 -> Stage 2)
                      Moves smoothly along the dotted line
                     ======================================================== */}
                  {idx === 0 && (
                    <div
                      className={`mover-wrapper ${currentStep === 1 ? 'is-active' : currentStep > 1 ? 'is-done' : 'is-hidden'}`}
                    >
                      <div className="mover-object message-mover">
                        <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                          <line x1="1" y1="8" x2="6" y2="8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                          <line x1="0" y1="12" x2="5" y2="12" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
                          <line x1="2" y1="16" x2="6" y2="16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                          <rect x="7" y="3" width="25" height="18" rx="3" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.2" />
                          <path d="M8 5L19.5 14L31 5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="19.5" cy="14" r="2.2" fill="#fef08a" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      OBJECT 2 FOR CANCELLED: CANCELLATION NOTICE MOVER (Stage 2 -> Stage 3)
                     ======================================================== */}
                  {isCancelled && idx === 1 && (
                    <div
                      className={`mover-wrapper ${currentStep === 2 ? 'is-active' : currentStep > 2 ? 'is-done' : 'is-hidden'}`}
                    >
                      <div className="mover-object cancel-mover">
                        <svg width="34" height="28" viewBox="0 0 34 28" fill="none">
                          <rect x="3" y="3" width="28" height="22" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.6" />
                          <path d="M12 9L22 19M22 9L12 19" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      OBJECT 2 FOR NORMAL: PARCEL CARTON BOX (Stage 2 -> Stage 3)
                     ======================================================== */}
                  {!isCancelled && idx === 1 && (
                    <div
                      className={`mover-wrapper ${currentStep === 2 ? 'is-active' : currentStep > 2 ? 'is-done' : 'is-hidden'}`}
                    >
                      <div className="mover-object package-mover">
                        <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
                          <path d="M17 2L31 9L17 16L3 9L17 2Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                          <path d="M3 9V22L17 29V16L3 9Z" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
                          <path d="M31 9V22L17 29V16L31 9Z" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />
                          <path d="M17 2V16" stroke="#ffffff" strokeWidth="2.8" strokeDasharray="2.5 1.5" />
                          <path d="M10 5.5L24 12.5" stroke="#fef3c7" strokeWidth="2.2" />
                          <rect x="21" y="18" width="6" height="4.5" rx="0.5" fill="#ffffff" opacity="0.9" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      OBJECT 3: BLUE DART TRUCK (Courier) OR HANDOVER ICON (Pickup)
                      (Stage 3 -> Stage 4)
                     ======================================================== */}
                  {!isCancelled && idx === 2 && (
                    <div
                      className={`mover-wrapper ${currentStep === 3 ? 'is-active' : currentStep > 3 ? 'is-done' : 'is-hidden'}`}
                    >
                      {isPickup ? (
                        <div className="mover-object package-mover">
                          <svg width="38" height="30" viewBox="0 0 38 30" fill="none">
                            <rect x="3" y="6" width="32" height="21" rx="4" fill="#16a34a" stroke="#15803d" strokeWidth="1.4" />
                            <path d="M13 6V4a3 3 0 0 1 6 0v2" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M11 16l5 5 11-10" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="mover-object truck-mover">
                          <svg width="56" height="32" viewBox="0 0 56 32" fill="none">
                            <circle cx="2" cy="19" r="1.5" fill="#94a3b8" opacity="0.6" />
                            <circle cx="0.5" cy="17.5" r="1" fill="#cbd5e1" opacity="0.4" />
                            <rect x="4" y="5" width="32" height="17" rx="2" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.4" />
                            <rect x="6" y="9" width="28" height="5" rx="1" fill="#ffffff" />
                            <text x="8" y="13" fontSize="3.8" fontWeight="900" fill="#00A3E0" fontFamily="sans-serif">BLUE DART</text>
                            <path d="M36 10H46L51 16V23H36V10Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.4" />
                            <path d="M38 12H44.5L48 16H38V12Z" fill="#e0f2fe" />
                            <circle cx="50" cy="19" r="1.5" fill="#fef08a" />
                            <path d="M51 18.5L55 17V21L51 19.5Z" fill="#fef08a" opacity="0.6" />
                            <rect x="4" y="22" width="46" height="1.8" fill="#1e293b" />
                            <circle cx="13" cy="23.5" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                            <circle cx="13" cy="23.5" r="2.8" fill="#cbd5e1" />
                            <circle cx="13" cy="23.5" r="1.2" fill="#1e293b" />
                            <circle cx="43" cy="23.5" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                            <circle cx="43" cy="23.5" r="2.8" fill="#cbd5e1" />
                            <circle cx="43" cy="23.5" r="1.2" fill="#1e293b" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================
                      OBJECT 4: DELIVERY BOY ON BIKE (Stage 4 -> Stage 5)
                     ======================================================== */}
                  {!isCancelled && idx === 3 && (
                    <div
                      className={`mover-wrapper ${currentStep === 4 ? 'is-active' : currentStep > 4 ? 'is-done' : 'is-hidden'}`}
                    >
                      <div className="mover-object bike-mover">
                        <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
                          <line x1="1" y1="20" x2="6" y2="20" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                          <line x1="3" y1="24" x2="8" y2="24" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
                          <rect x="13" y="11" width="8" height="10" rx="1.5" fill="#10b981" stroke="#047857" strokeWidth="1.2" />
                          <rect x="15" y="13" width="4" height="4.5" rx="0.5" fill="#ffffff" opacity="0.9" />
                          <circle cx="26" cy="7" r="4.2" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.2" />
                          <path d="M27 6.5H30.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M25 11L27 18L22 22" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M25 13L32 16" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="33" cy="16" r="1.2" fill="#0f172a" />
                          <path d="M14 26L23 23L32 16L34 22L38 26" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M23 23H29" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                          <path d="M35 19L39 18V21L35 20Z" fill="#fef08a" />
                          <circle cx="12" cy="26.5" r="5.2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <circle cx="12" cy="26.5" r="2.8" fill="#cbd5e1" />
                          <circle cx="12" cy="26.5" r="1.2" fill="#1e293b" />
                          <circle cx="38" cy="26.5" r="5.2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <circle cx="38" cy="26.5" r="2.8" fill="#cbd5e1" />
                          <circle cx="38" cy="26.5" r="1.2" fill="#1e293b" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Live Description Strip */}
      <div className="stepper-stage-status-desc">
        {isCancelled ? (
          <>
            {currentStep === 1 && (
              <div className="status-narrative">
                <span className="narrative-tag">STAGE 1</span>
                <strong>Order Placed & Payment Confirmed</strong>: Order was created and initial verification completed.
              </div>
            )}
            {currentStep === 2 && (
              <div className="status-narrative orange">
                <span className="narrative-tag orange">STAGE 2</span>
                <strong>Pre-Dispatch Verification Halted</strong>: Order cancellation request received and processed before courier handover.
              </div>
            )}
            {currentStep === 3 && (
              <div className="status-narrative red">
                <span className="narrative-tag red">STAGE 3 • CANCELLED</span>
                <strong>Order Cancelled & 100% Refund Initiated!</strong> Package transit stopped. Full amount reversed to your payment method.
              </div>
            )}
          </>
        ) : isPickup ? (
          <>
            {currentStep === 1 && (
              <div className="status-narrative">
                <span className="narrative-tag">STAGE 1</span>
                <strong>Order Placed & Payment Confirmed</strong>: Order received and routed to your designated regional logistics hub.
              </div>
            )}
            {currentStep === 2 && (
              <div className="status-narrative orange">
                <span className="narrative-tag orange">STAGE 2</span>
                <strong>Preparing & Packing Order</strong>: Hub team is packing and verifying items from local shelf stock.
              </div>
            )}
            {currentStep === 3 && (
              <div className="status-narrative blue">
                <span className="narrative-tag blue">STAGE 3 • READY TO PICK UP</span>
                <strong>Parcel Ready for Counter Pickup!</strong> Your order is packed and waiting at <strong>{order?.hubName || 'the regional logistics hub counter'}</strong>. Please present your Order ID ({order?.orderId || order?.id}) to collect.
              </div>
            )}
            {currentStep === 4 && (
              <div className="status-narrative green">
                <span className="narrative-tag green">STAGE 4 • DELIVERED</span>
                <strong>Order Collected Successfully!</strong> Parcel handed over and verified at regional hub counter. Thank you for shopping with Atomy India!
              </div>
            )}
          </>
        ) : (
          <>
            {currentStep === 1 && (
              <div className="status-narrative">
                <span className="narrative-tag">STAGE 1</span>
                <strong>Order Placed & Payment Confirmed</strong>: Order details verified. Initial dispatch notification sent to warehouse.
              </div>
            )}
            {currentStep === 2 && (
              <div className="status-narrative orange">
                <span className="narrative-tag orange">STAGE 2</span>
                <strong>Preparing & Product Packing</strong>: Items picked, barcode-verified, and sealed in central fulfillment facility.
              </div>
            )}
            {currentStep === 3 && (
              <div className="status-narrative blue">
                <span className="narrative-tag blue">STAGE 3 • SHIPPED</span>
                <strong>In Transit via Blue Dart</strong>: Dispatched from central warehouse. <em>(Note: You can still cancel, but after starting transit the amount will not be refunded).</em>
              </div>
            )}
            {currentStep === 4 && (
              <div className="status-narrative purple">
                <span className="narrative-tag purple">STAGE 4</span>
                <strong>Out for Delivery on Bike</strong>: Delivery executive on motorbike is navigating the final route to your doorstep.
              </div>
            )}
            {currentStep === 5 && (
              <div className="status-narrative green">
                <span className="narrative-tag green">STAGE 5 • DELIVERED</span>
                <strong>Package Successfully Delivered!</strong> Covered by 7-Day Free Replacement for transit damage or wrong item received (customer-damaged items strictly ineligible).
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
