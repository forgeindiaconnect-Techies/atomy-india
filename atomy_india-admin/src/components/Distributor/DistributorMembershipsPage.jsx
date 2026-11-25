import React, { useState, useEffect, useMemo } from 'react';
import { 
  Crown, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Truck, 
  X, 
  CheckCircle2, 
  ArrowLeft,
  User,
  CreditCard,
  Clock,
  AlertCircle,
  Eye,
  Package,
  Zap,
  History,
  Repeat
} from 'lucide-react';
import { fetchMembersFromBackend } from '../../services/membershipService';
import '../Admin/AdminDashboard.css';

export default function DistributorMembershipsPage({ distributor, territoryOrders = [], isSubstitute = false, isStandby = false }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState(null);

  const primaryPin = distributor?.primaryPincode || distributor?.parentHubPincode || distributor?.pincode || '';
  const assignedPins = distributor?.assignedPincodes || [primaryPin].filter(Boolean);

  const territoryOrderEmails = useMemo(() => {
    return (territoryOrders || []).map(o => (o.customerEmail || '').toLowerCase().trim()).filter(Boolean).join(',');
  }, [territoryOrders]);

  useEffect(() => {
    let isMounted = true;
    async function loadMembers(isInitial = false) {
      if (isInitial) setIsLoading(true);
      try {
        const all = await fetchMembersFromBackend();
        if (!isMounted) return;

        const myPins = new Set(
          [
            distributor?.primaryPincode,
            distributor?.parentHubPincode,
            distributor?.pincode,
            ...(Array.isArray(distributor?.assignedPincodes) ? distributor.assignedPincodes : [])
          ]
          .filter(Boolean)
          .map(p => String(p).trim())
        );

        const territoryEmails = new Set(
          (territoryOrders || []).map(o => (o.customerEmail || '').toLowerCase().trim()).filter(Boolean)
        );

        // Filter members that belong to this distributor's territory (by pincode or territory orders)
        const territoryMembers = (all || []).filter(m => {
          const pin = String(m.pincode || m.pin || '').trim();
          const email = (m.email || m.customerEmail || '').toLowerCase().trim();
          if (myPins.size > 0 && myPins.has(pin)) return true;
          if (email && territoryEmails.has(email)) return true;
          return false;
        });

        // Deduplicate strictly by customer email so same customer never appears as duplicate rows
        const deduplicatedMap = new Map();
        for (const m of territoryMembers) {
          const emailKey = (m.customerEmail || m.email || '').toLowerCase().trim();
          if (!emailKey) continue;
          if (!deduplicatedMap.has(emailKey)) {
            deduplicatedMap.set(emailKey, m);
          } else {
            const existing = deduplicatedMap.get(emailKey);
            const isCurrActive = String(m.status || '').toUpperCase() === 'ACTIVE';
            const isExistActive = String(existing.status || '').toUpperCase() === 'ACTIVE';
            if (isCurrActive && !isExistActive) {
              // Elevate active record as primary and preserve history
              const combinedHist = [
                ...(Array.isArray(m.purchaseHistory) ? m.purchaseHistory : []),
                ...(Array.isArray(existing.purchaseHistory) ? existing.purchaseHistory : [])
              ];
              m.purchaseHistory = combinedHist;
              m.timesPurchased = Math.max(combinedHist.length, (m.timesPurchased || 1) + 1);
              deduplicatedMap.set(emailKey, m);
            } else {
              const combinedHist = [
                ...(Array.isArray(existing.purchaseHistory) ? existing.purchaseHistory : []),
                ...(Array.isArray(m.purchaseHistory) ? m.purchaseHistory : [])
              ];
              existing.purchaseHistory = combinedHist;
              existing.timesPurchased = Math.max(combinedHist.length, (existing.timesPurchased || 1) + 1);
              deduplicatedMap.set(emailKey, existing);
            }
          }
        }

        setMembers(Array.from(deduplicatedMap.values()));
      } catch (e) {
        console.error('Failed to load territory members', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadMembers(members.length === 0);

    return () => { isMounted = false; };
  }, [primaryPin, territoryOrderEmails]);

  const getCalculatedExpiry = (member) => {
    if (member?.expiryDate) return member.expiryDate;
    const start = member?.startDate || member?.joinedAt || member?.enrolledAt || member?.createdAt;
    if (start) {
      try {
        const d = new Date(start);
        if (!isNaN(d.getTime())) {
          if (String(member?.plan || '').toUpperCase() === 'MONTHLY') {
            d.setMonth(d.getMonth() + 1);
          } else {
            d.setFullYear(d.getFullYear() + 1);
          }
          return d.toISOString().split('T')[0];
        }
      } catch {}
    }
    return '';
  };

  const isMemberExpired = (m) => {
    if (String(m?.status || '').toUpperCase() === 'EXPIRED') return true;
    const expiryVal = m?.expiryDate || getCalculatedExpiry(m);
    if (expiryVal) {
      try {
        const exp = new Date(expiryVal);
        if (!isNaN(exp.getTime())) {
          const now = new Date();
          const isToday = (
            exp.getFullYear() === now.getFullYear() &&
            exp.getMonth() === now.getMonth() &&
            exp.getDate() === now.getDate()
          );
          return exp <= now || isToday;
        }
      } catch {}
    }
    return false;
  };

  const isMemberActive = (m) => String(m?.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && !isMemberExpired(m);

  const filtered = members.filter((m) => {
    if (selectedPlanFilter !== 'ALL') {
      const pl = String(m.plan || 'ANNUAL').toUpperCase();
      if (!pl.includes(selectedPlanFilter)) return false;
    }

    if (memberSearchQuery.trim()) {
      const q = memberSearchQuery.toLowerCase().trim();
      const matchName = String(m.name || m.fullName || m.customerName || '').toLowerCase().includes(q);
      const matchEmail = String(m.email || m.customerEmail || '').toLowerCase().includes(q);
      const matchId = String(m.memberId || m.id || '').toLowerCase().includes(q);
      const matchPin = String(m.pincode || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchPin) return false;
    }

    return true;
  });

  const activeCount = members.filter(isMemberActive).length;
  const expiredCount = members.filter(isMemberExpired).length;
  const annualCount = members.filter(m => String(m.plan || '').toUpperCase().includes('ANNUAL')).length;
  const monthlyCount = members.filter(m => String(m.plan || '').toUpperCase().includes('MONTHLY')).length;

  const formatMembershipDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).split('T')[0];
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return String(dateVal).split('T')[0];
    }
  };

  const getPlanPrice = (member) => {
    if (member?.amountPaid && Number(member.amountPaid) > 0) {
      return Number(member.amountPaid);
    }
    const isMonthly = String(member?.plan || '').toUpperCase() === 'MONTHLY';
    return isMonthly ? 299 : 2499;
  };

  // =========================================================================
  // DETAILED VIEW (INNER PAGE) FOR SELECTED MEMBER
  // =========================================================================
  if (selectedMember) {
    const enrolledDateVal = selectedMember.startDate || selectedMember.joinedAt || selectedMember.enrolledAt || selectedMember.createdAt;
    const expiryDateVal = getCalculatedExpiry(selectedMember);
    const isMonthly = String(selectedMember.plan || '').toUpperCase() === 'MONTHLY';
    const active = isMemberActive(selectedMember);
    const expired = isMemberExpired(selectedMember);
    const memberPrice = getPlanPrice(selectedMember);

    // Compute and consolidate subscription & renewal history
    const rawHistory = Array.isArray(selectedMember.purchaseHistory) ? selectedMember.purchaseHistory : [];
    let purchaseHistory = [];
    if (rawHistory.length > 0) {
      purchaseHistory = [...rawHistory].map((h, i) => ({
        cycle: h.cycle || (rawHistory.length - i),
        plan: h.plan || selectedMember.plan || 'MONTHLY',
        amountPaid: Number(h.amountPaid || (String(h.plan || '').toUpperCase() === 'ANNUAL' ? 2499 : 299)),
        paymentMethod: h.paymentMethod || selectedMember.paymentMethod || 'UPI / Razorpay',
        paymentId: h.paymentId || selectedMember.paymentId || 'pay_atomy_online',
        startDate: h.startDate || enrolledDateVal,
        expiryDate: h.expiryDate || expiryDateVal,
        status: h.status || (i === 0 && active ? 'ACTIVE' : 'COMPLETED')
      }));
    } else {
      const times = selectedMember.timesPurchased || (active ? 2 : 1);
      purchaseHistory.push({
        cycle: times,
        plan: selectedMember.plan || 'MONTHLY',
        amountPaid: memberPrice,
        paymentMethod: selectedMember.paymentMethod || 'UPI / Razorpay',
        paymentId: selectedMember.paymentId || 'pay_atomy_latest',
        startDate: enrolledDateVal,
        expiryDate: expiryDateVal,
        status: active ? 'ACTIVE' : 'EXPIRED'
      });
      if (times > 1) {
        const priorStart = new Date(enrolledDateVal || Date.now());
        priorStart.setMonth(priorStart.getMonth() - 1);
        purchaseHistory.push({
          cycle: 1,
          plan: 'MONTHLY',
          amountPaid: 299,
          paymentMethod: 'UPI / Razorpay',
          paymentId: 'pay_atomy_initial',
          startDate: priorStart.toISOString().split('T')[0],
          expiryDate: enrolledDateVal,
          status: 'COMPLETED'
        });
      }
    }

    const totalTimesPurchased = Math.max(purchaseHistory.length, selectedMember.timesPurchased || 1);
    const totalLifetimeInvestment = purchaseHistory.reduce((acc, p) => acc + (Number(p.amountPaid) || 0), 0) || (memberPrice * totalTimesPurchased);

    return (
      <div className="admin-tab-content animate-fade-in" style={{ paddingBottom: '40px' }}>
        {/* Back navigation header */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            className="membership-btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={16} /> Back to Territory Members
          </button>

          <span style={{
            fontSize: '12px',
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            Member ID: <strong>{selectedMember.id || selectedMember.memberId}</strong>
          </span>
        </div>

        {/* Member Profile Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #08267e 0%, #0d3b82 100%)',
          borderRadius: '14px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(8, 38, 126, 0.16)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {(selectedMember.name || selectedMember.customerName || 'M').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {selectedMember.name || selectedMember.customerName}
                </h2>
                <span style={{
                  background: active ? '#22c55e' : '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  {active ? '● Active' : '✕ Expired'}
                </span>
                <span style={{
                  background: isMonthly ? 'rgba(255, 255, 255, 0.16)' : 'rgba(251, 191, 36, 0.25)',
                  color: isMonthly ? '#ffffff' : '#fef08a',
                  border: isMonthly ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid #fde047',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}>
                  {isMonthly ? 'Monthly VIP Plan' : 'Annual VIP Plan'}
                </span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}>
                  {totalTimesPurchased} {totalTimesPurchased === 1 ? 'Subscription' : 'Total Renewals'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#cbd5e1' }}>
                {selectedMember.email || selectedMember.customerEmail} • {selectedMember.phone || selectedMember.customerPhone || '+91 9876543210'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Lifetime Plan Investment
            </span>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              ₹ {totalLifetimeInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '12px', color: '#93c5fd', display: 'block' }}>
              {totalTimesPurchased} {totalTimesPurchased === 1 ? 'Plan Purchase' : 'Purchases / Renewals'} • {isMonthly ? '₹ 299/mo' : '₹ 2,499/yr'}
            </span>
          </div>
        </div>

        {/* 3 Detailed Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Card 1: Customer Identity & Territory */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#08267e" /> Customer &amp; Territory Coordinates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Full Name:</span>
                <strong style={{ color: '#0f172a' }}>{selectedMember.name || selectedMember.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Member ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#08267e' }}>
                  {selectedMember.id || selectedMember.memberId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <span style={{ color: '#0f172a' }}>{selectedMember.email || selectedMember.customerEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Phone Number:</span>
                <span style={{ color: '#0f172a' }}>{selectedMember.phone || selectedMember.customerPhone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Delivery PIN:</span>
                <strong style={{ color: '#08267e' }}>{selectedMember.pincode || distributor?.primaryPincode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Territory:</span>
                <span style={{ color: '#0f172a' }}>{selectedMember.city || distributor?.city || 'Krishnagiri'}, {selectedMember.state || distributor?.state || 'Tamil Nadu'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Plan & Billing Details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#08267e" /> Subscription &amp; Billing Cycle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Plan Tier:</span>
                <strong style={{ color: isMonthly ? '#08267e' : '#b45309' }}>
                  {isMonthly ? 'Monthly Distributor VIP' : 'Annual Distributor VIP'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Times Renewed / Bought:</span>
                <strong style={{ color: '#08267e' }}>{totalTimesPurchased} {totalTimesPurchased === 1 ? 'Time' : 'Times'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Current Amount Paid:</span>
                <strong style={{ color: '#0f172a' }}>₹ {memberPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span style={{ color: '#0f172a' }}>{selectedMember.paymentMethod || 'UPI / Razorpay'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Start Date:</span>
                <strong style={{ color: '#0f172a' }}>{formatMembershipDate(enrolledDateVal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Expiry Date:</span>
                <strong style={{ color: active ? '#15803d' : '#b91c1c' }}>
                  {formatMembershipDate(expiryDateVal)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{
                  fontWeight: 700,
                  color: active ? '#15803d' : '#b91c1c'
                }}>
                  {active ? 'Active (Auto-Renew)' : 'Expired (Reactivation Required)'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Territory Logistics & Privileges */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#08267e" /> Logistics &amp; Wholesale Privileges
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Wholesale DP Rate:</span>
                <span style={{ fontWeight: 700, color: active ? '#15803d' : '#94a3b8' }}>
                  {active ? '✓ Unlocked (~18% below MRP)' : '✕ Reverted to MRP'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>PV Point Earning:</span>
                <span style={{ fontWeight: 700, color: active ? '#08267e' : '#94a3b8' }}>
                  {active ? '✓ Active (100% Personal PV)' : '✕ Paused'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Courier Express SLA:</span>
                <strong style={{ color: '#0f172a' }}>24-48 Hours Priority</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Assigned Hub:</span>
                <span style={{ color: '#0f172a' }}>{distributor?.businessName || 'Regional Hub'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Delivery Courier:</span>
                <span style={{ color: '#08267e', fontWeight: 600 }}>Blue Dart Express (Air Priority)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Subscription & Renewal Plan Purchase History */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={19} color="#08267e" /> Subscription &amp; Renewal Plan Purchase History
            </h3>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #c7d2fe'
            }}>
              {totalTimesPurchased} {totalTimesPurchased === 1 ? 'Subscription Cycle' : 'Subscription Cycles Logged'}
            </span>
          </div>

          {/* 4 Summary Stat Mini-Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                Total Plan Purchases
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#08267e' }}>
                {totalTimesPurchased} {totalTimesPurchased === 1 ? 'Time' : 'Times'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                Initial enrollment + renewals
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                Active Plan Tier
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isMonthly ? '#08267e' : '#b45309' }}>
                {isMonthly ? 'Monthly VIP' : 'Annual VIP'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                {isMonthly ? '₹ 299 / month' : '₹ 2,499 / year'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                Lifetime Investment
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
                ₹ {totalLifetimeInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                Total subscription revenue
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                Membership Status
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: active ? '#15803d' : '#b91c1c' }}>
                {active ? 'Active' : 'Expired'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                {active ? 'DP Wholesale Unlocked' : 'Reactivation Required'}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="atomy-table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="atomy-data-table" style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '14%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Cycle #</th>
                  <th style={{ width: '22%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Plan Tier</th>
                  <th style={{ width: '16%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Subscription Date</th>
                  <th style={{ width: '16%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Valid Until (Expiry)</th>
                  <th style={{ width: '12%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Amount Paid</th>
                  <th style={{ width: '10%', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 16px' }}>Payment Mode</th>
                  <th style={{ width: '10%', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((item, idx) => {
                  const itemPlanIsMonthly = String(item.plan || '').toUpperCase().includes('MONTHLY');
                  const itemActive = String(item.status || '').toUpperCase() === 'ACTIVE';
                  const isCurrent = itemActive; // Only show current badge when cycle is actively in effect
                  return (
                    <tr key={idx} style={{ background: isCurrent ? 'rgba(8, 38, 126, 0.02)' : 'transparent' }}>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          background: isCurrent ? '#dbeafe' : '#f1f5f9',
                          color: isCurrent ? '#1e40af' : '#475569',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          lineHeight: 1
                        }}>
                          Cycle {item.cycle || (purchaseHistory.length - idx)}
                          {isCurrent && (
                            <span style={{
                              fontSize: '10px',
                              background: '#2563eb',
                              color: '#fff',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              letterSpacing: '0.3px',
                              lineHeight: 1
                            }}>
                              CURRENT
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: itemPlanIsMonthly ? '#08267e' : '#b45309',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          fontSize: '13.5px'
                        }}>
                          <Crown size={15} color={itemPlanIsMonthly ? '#08267e' : '#d97706'} />
                          {itemPlanIsMonthly ? 'Monthly Distributor VIP' : 'Annual Distributor VIP'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px', color: '#334155' }}>
                        {formatMembershipDate(item.startDate)}
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <strong style={{ color: itemActive ? '#15803d' : '#64748b' }}>
                          {formatMembershipDate(item.expiryDate)}
                        </strong>
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <strong style={{ color: '#0f172a' }}>
                          ₹ {Number(item.amountPaid || (itemPlanIsMonthly ? 299 : 2499)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {item.paymentMethod || 'UPI / Razorpay'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap', padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: itemActive ? '#dcfce7' : '#f1f5f9',
                          color: itemActive ? '#15803d' : '#64748b',
                          border: itemActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2
                        }}>
                          {itemActive ? '● Active' : '✓ Completed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN MEMBERSHIP ACCOUNTS LIST VIEW (CLEAN, MINIMAL & UNCLUTTERED)
  // =========================================================================
  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={22} color="#eab308" />
              <span>Territory Membership &amp; Loyalty Privileges</span>
            </span>
          </h2>
          <p className="content-subtitle">
            Privileged Atomy Distributor Members residing in your assigned delivery PIN code: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state}).
          </p>
        </div>
      </div>

      {/* 2. Membership KPI Cards Strip */}
      <div className="kpi-gradient-grid">
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)',
            '--card-border': '#fde047',
            '--card-title-color': '#a16207'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Territory Members</div>
            <div className="kpi-grad-icon-wrap">
              <Crown size={19} color="#ca8a04" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {members.length} <span className="kpi-grad-unit">enrolled</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ {activeCount} active • {expiredCount} expired</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#ca8a04" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(202, 138, 4, 0.08)" />
            </svg>
          </div>
        </div>

        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
            '--card-border': '#bbf7d0',
            '--card-title-color': '#15803d'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Annual Privilege Tier</div>
            <div className="kpi-grad-icon-wrap">
              <Sparkles size={19} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {annualCount} <span className="kpi-grad-unit">VIPs</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">{monthlyCount} Monthly VIP subscribers</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(22, 163, 74, 0.08)" />
            </svg>
          </div>
        </div>

        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)',
            '--card-border': '#c7d2fe',
            '--card-title-color': '#08267e'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Courier SLA Speed</div>
            <div className="kpi-grad-icon-wrap">
              <Truck size={19} color="#08267e" />
            </div>
          </div>
          <div className="kpi-grad-val">
            24-48 <span className="kpi-grad-unit">hrs</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Priority dispatch for members</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#08267e" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(8, 38, 126, 0.08)" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Search and Summary Filter Bar */}
      <div className="orders-filter-row">
        <div className="search-input-wrapper orders-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Member ID, Name, Email, or PIN..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {memberSearchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setMemberSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="orders-summary-pill">
          <span>Showing <strong>{filtered.length}</strong> of <strong>{members.length}</strong> Territory Members</span>
        </div>
      </div>

      {/* Substitute Distributor Command Active Banner */}
      {isSubstitute && !isStandby && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Sparkles size={16} color="#2563eb" />
          <span>Temporary Substitute Command Active — Managing Territory Members for Hub (PIN: {primaryPin})</span>
        </div>
      )}

      {/* 4. Streamlined Members Table: Only Customer, Plan, Amount Paid, Start Date, Expiry Date, Status, and Action */}
      <div className="atomy-table-responsive" style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
        <table className="atomy-data-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '28%', padding: '12px 14px' }}>Customer</th>
              <th style={{ width: '14%', textAlign: 'center', padding: '12px 8px' }}>Plan</th>
              <th style={{ width: '13%', padding: '12px 8px' }}>Amount Paid</th>
              <th style={{ width: '13%', padding: '12px 8px' }}>Start Date</th>
              <th style={{ width: '13%', padding: '12px 8px' }}>Expiry Date</th>
              <th style={{ width: '10%', textAlign: 'center', padding: '12px 8px' }}>Status</th>
              <th style={{ width: '9%', textAlign: 'center', padding: '12px 8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="table-empty-row" style={{ padding: '32px 14px' }}>
                  <p>Loading territory members...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty-row" style={{ padding: '32px 14px' }}>
                  <Crown size={36} color="#94a3b8" />
                  <p>No members registered in this territory matching search query.</p>
                </td>
              </tr>
            ) : (
              filtered.map((m, idx) => {
                const enrolledDateVal = m.startDate || m.joinedAt || m.enrolledAt || m.createdAt;
                const expiryDateVal = getCalculatedExpiry(m);
                const isMonthly = String(m.plan || '').toUpperCase() === 'MONTHLY';
                const active = isMemberActive(m);
                const memberPrice = getPlanPrice(m);

                return (
                  <tr 
                    key={m.id || m.memberId || idx}
                    onClick={() => setSelectedMember(m)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    title="Click to view detailed customer and plan profile"
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div className="customer-avatar-row">
                        <div className="customer-avatar-circle" style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #fde047' }}>
                          {(m.name || m.customerName || 'M').slice(0, 1).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div className="cell-primary-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.name || m.customerName}
                          </div>
                          <div className="cell-secondary-text" style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.id || m.memberId || `ATM-MEM-${idx + 1001}`} • {m.email || m.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: isMonthly ? '#eef2ff' : '#fef9c3',
                        color: isMonthly ? '#08267e' : '#a16207',
                        border: isMonthly ? '1px solid #c7d2fe' : '1px solid #fef08a',
                        whiteSpace: 'nowrap'
                      }}>
                        <Crown size={12} /> {isMonthly ? 'Monthly VIP' : 'Annual VIP'}
                      </span>
                      {Number(m.timesPurchased) > 1 && (
                        <div style={{ marginTop: '3px' }}>
                          <span style={{
                            fontSize: '10.5px',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '1px 7px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            {m.timesPurchased}x Purchases
                          </span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        ₹ {memberPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div className="order-date-text" style={{ whiteSpace: 'nowrap' }}>
                        {formatMembershipDate(enrolledDateVal)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div className="order-date-text" style={{ color: active ? '#15803d' : '#b91c1c', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {formatMembershipDate(expiryDateVal)}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                      {active ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap'
                        }}>
                          Active
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecdd3',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap'
                        }}>
                          Expired
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(m);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid #c7d2fe',
                          background: '#eef2ff',
                          color: '#08267e',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
