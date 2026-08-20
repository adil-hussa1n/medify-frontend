import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Core';

export interface FinancialItem {
  id: string;
  type: 'doctor_appointment' | 'diagnostic_test' | 'hospital_opd';
  title: string;
  patientName: string;
  patientPhone?: string;
  referenceNo?: string;
  date: string;
  grossAmount: number;
  medifyFee: number; // 20 TK platform commission
  netAmount: number; // grossAmount - 20
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  paymentMethod?: string;
  chamberOrDept?: string;
  doctorName?: string;
  category?: string;
}

interface FinancialReportViewProps {
  title: string;
  subtitle?: string;
  tenantName: string;
  tenantType: 'doctor' | 'hospital' | 'diagnostic' | 'superadmin';
  items: FinancialItem[];
  extraFilters?: React.ReactNode;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({
  title,
  subtitle,
  tenantName,
  tenantType,
  items,
  extraFilters,
}) => {
  const isSuperAdmin = tenantType === 'superadmin' || title.toLowerCase().includes('super admin');
  // State Filters
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom' | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date checker
  const isWithinDateRange = (itemDate: string) => {
    if (!itemDate) return true;
    if (dateRange === 'today') return itemDate === todayStr;
    if (dateRange === '7days') {
      const d = new Date(itemDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return d >= sevenDaysAgo;
    }
    if (dateRange === '30days') {
      const d = new Date(itemDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d >= thirtyDaysAgo;
    }
    if (dateRange === 'custom') {
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    }
    return true;
  };

  // Unique Sub-filter options (e.g. Chambers, Departments, Doctors, or Test Categories)
  const subFilterOptions = Array.from(
    new Set(
      items
        .map((i) => i.chamberOrDept || i.doctorName || i.category)
        .filter(Boolean) as string[]
    )
  );

  // Apply filters
  const filteredItems = items
    .filter((item) => {
      if (!isWithinDateRange(item.date)) return false;
      if (paymentFilter !== 'all' && item.paymentStatus !== paymentFilter) return false;
      if (selectedSubFilter !== 'all') {
        const match =
          item.chamberOrDept === selectedSubFilter ||
          item.doctorName === selectedSubFilter ||
          item.category === selectedSubFilter;
        if (!match) return false;
      }
      if (minAmount !== '' && item.grossAmount < Number(minAmount)) return false;
      if (maxAmount !== '' && item.grossAmount > Number(maxAmount)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(q) ||
          item.patientName.toLowerCase().includes(q) ||
          (item.referenceNo && item.referenceNo.toLowerCase().includes(q)) ||
          (item.patientPhone && item.patientPhone.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.grossAmount - a.grossAmount;
      if (sortBy === 'amount_asc') return a.grossAmount - b.grossAmount;
      return 0;
    });

  // Financial Metrics Calculation
  const totalCount = filteredItems.length;
  const paidItems = filteredItems.filter((i) => i.paymentStatus === 'paid');
  const unpaidItems = filteredItems.filter((i) => i.paymentStatus === 'unpaid');

  const totalGrossRevenue = filteredItems.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const paidGrossRevenue = paidItems.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const unpaidGrossRevenue = unpaidItems.reduce((acc, curr) => acc + curr.grossAmount, 0);

  // Medify Platform Fee: 20 TK collected per transaction (for paid items, or projected across all)
  const totalMedifyProfit = paidItems.length * 20;
  const projectedMedifyProfit = totalCount * 20;

  // Net earnings after 20 TK deduction per transaction
  const netEarnings = paidGrossRevenue - totalMedifyProfit;

  const handleExportCSV = () => {
    const headers = ['Ref / ID', 'Date', 'Type / Service', 'Patient', 'Chamber/Doctor/Dept', 'Gross Fee (TK)', 'Medify Platform Profit (TK)', 'Net Payout (TK)', 'Payment Status'];
    const rows = filteredItems.map((i) => [
      `"${i.referenceNo || i.id}"`,
      `"${i.date}"`,
      `"${i.title}"`,
      `"${i.patientName}"`,
      `"${i.chamberOrDept || i.doctorName || i.category || 'N/A'}"`,
      i.grossAmount,
      20,
      i.paymentStatus === 'paid' ? i.grossAmount - 20 : 0,
      `"${i.paymentStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tenantType}_financial_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="financial-report-view">
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={22} color="var(--primary-800)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{title}</h2>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
            {subtitle || `Financial statement and automated revenue breakdown for ${tenantName}`}
          </p>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
          Export CSV Statement
        </Button>
      </div>

      {/* MEDIFY PROFIT SPOTLIGHT BANNER - Dynamic by role perspective */}
      <div
        style={{
          background: isSuperAdmin
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '540px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                background: isSuperAdmin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.25)',
                color: isSuperAdmin ? '#4ade80' : '#60a5fa',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <TrendingUp size={13} /> {isSuperAdmin ? 'Platform Revenue Engine (৳20 / Order)' : 'Medify 24/7 Partner Settlement'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
            {isSuperAdmin ? 'Medify Platform Revenue & Provider Payout Breakdown' : 'Medify Platform Fee Collection & Net Settlement'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
            {isSuperAdmin
              ? 'Medify collects a flat ৳20 TK platform processing fee from each doctor appointment serial and laboratory test booking. The remaining funds are disbursed directly to partner hospitals, diagnostic labs, and doctor practices.'
              : 'Our platform collects a fixed ৳20 TK platform charge per completed doctor appointment serial / lab diagnostic test booking. The remaining balance goes directly to your institution/practice payout.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              textAlign: 'center',
              minWidth: '160px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#7dd3fc', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              {isSuperAdmin ? 'Total Medify Profit' : 'Medify Platform Fee'}
            </span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              ৳{totalMedifyProfit.toLocaleString()}
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#bae6fd', display: 'block', marginTop: '0.15rem' }}>
              ৳20 × {paidItems.length} Paid Bookings
            </span>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              textAlign: 'center',
              minWidth: '165px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              {isSuperAdmin ? 'Provider Payouts Disbursed' : 'Your Net Payout'}
            </span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
              ৳{netEarnings.toLocaleString()}
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#d1fae5', display: 'block', marginTop: '0.15rem' }}>
              {isSuperAdmin ? 'Total Paid Collections minus ৳20 fees' : 'Gross minus ৳20/order'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="text-xs text-muted">Total Gross Bookings</span>
            <Receipt size={16} color="var(--primary-700)" />
          </div>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>
            ৳{totalGrossRevenue.toLocaleString()}
          </strong>
          <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.2rem' }}>
            {totalCount} Total Transactions
          </span>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="text-xs text-muted">Paid Collections</span>
            <CheckCircle2 size={16} color="var(--success-600)" />
          </div>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>
            ৳{paidGrossRevenue.toLocaleString()}
          </strong>
          <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.2rem' }}>
            {paidItems.length} Collections Settled
          </span>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="text-xs text-muted">Pending / Due Collections</span>
            <Clock size={16} color="var(--warning-600)" />
          </div>
          <strong style={{ fontSize: '1.35rem', color: 'var(--warning-600)' }}>
            ৳{unpaidGrossRevenue.toLocaleString()}
          </strong>
          <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.2rem' }}>
            {unpaidItems.length} Pending at Reception/Desk
          </span>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-700)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="text-xs text-muted">{isSuperAdmin ? 'Medify Net Profit' : 'Platform Fee Deducted'}</span>
            <ArrowUpRight size={16} color="var(--primary-700)" />
          </div>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>
            ৳{totalMedifyProfit.toLocaleString()}
          </strong>
          <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.2rem' }}>
            Flat ৳20 × {paidItems.length} settled orders
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="text-xs text-muted" style={{ fontWeight: 600, marginRight: '0.25rem' }}>
              <Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
              Period:
            </span>
            <button
              className={`btn btn-sm ${dateRange === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDateRange('all')}
            >
              All Time
            </button>
            <button
              className={`btn btn-sm ${dateRange === 'today' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDateRange('today')}
            >
              Today
            </button>
            <button
              className={`btn btn-sm ${dateRange === '7days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDateRange('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`btn btn-sm ${dateRange === '30days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDateRange('30days')}
            >
              Last 30 Days
            </button>
            <button
              className={`btn btn-sm ${dateRange === 'custom' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDateRange('custom')}
            >
              Custom Date
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '320px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search patient, ref, test..."
              className="form-input"
              style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.82rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Extended Filter Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-200)', alignItems: 'center' }}>
          {/* Custom Date Inputs if selected */}
          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                style={{ height: '32px', fontSize: '0.8rem', width: '135px' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-xs text-muted">to</span>
              <input
                type="date"
                className="form-input"
                style={{ height: '32px', fontSize: '0.8rem', width: '135px' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Payment Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="text-xs text-muted">Payment:</span>
            <select
              className="form-select"
              style={{ height: '32px', fontSize: '0.8rem', width: '120px' }}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid (৳)</option>
              <option value="unpaid">Unpaid / Due</option>
            </select>
          </div>

          {/* Dynamic Sub-filter (Chamber / Doctor / Dept) */}
          {subFilterOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="text-xs text-muted">
                {tenantType === 'doctor' ? 'Chamber:' : tenantType === 'hospital' ? 'Doctor / Dept:' : 'Category / Type:'}
              </span>
              <select
                className="form-select"
                style={{ height: '32px', fontSize: '0.8rem', maxWidth: '180px' }}
                value={selectedSubFilter}
                onChange={(e) => setSelectedSubFilter(e.target.value)}
              >
                <option value="all">All Locations / Entities</option>
                {subFilterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="text-xs text-muted">Sort:</span>
            <select
              className="form-select"
              style={{ height: '32px', fontSize: '0.8rem', width: '135px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date_desc">Latest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="amount_desc">Highest Fee</option>
              <option value="amount_asc">Lowest Fee</option>
            </select>
          </div>

          {/* Amount / Price Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="text-xs text-muted">Fee (৳):</span>
            <input
              type="number"
              placeholder="Min"
              className="form-input"
              style={{ height: '32px', fontSize: '0.8rem', width: '70px', padding: '0 0.4rem' }}
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : '')}
            />
            <span className="text-xs text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              className="form-input"
              style={{ height: '32px', fontSize: '0.8rem', width: '70px', padding: '0 0.4rem' }}
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          {extraFilters}

          {/* Clear Filters */}
          {(dateRange !== 'all' || paymentFilter !== 'all' || selectedSubFilter !== 'all' || searchQuery || minAmount !== '' || maxAmount !== '' || sortBy !== 'date_desc') && (
            <button
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.75rem', height: '30px', padding: '0 0.5rem', marginLeft: 'auto' }}
              onClick={() => {
                setDateRange('all');
                setStartDate('');
                setEndDate('');
                setPaymentFilter('all');
                setSelectedSubFilter('all');
                setSearchQuery('');
                setMinAmount('');
                setMaxAmount('');
                setSortBy('date_desc');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transaction Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            Financial Ledger & Payout Breakdown ({filteredItems.length} Records)
          </span>
          <span className="text-xs text-muted">
            Showing filtered ledger entries
          </span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tx / Date</th>
                <th>Service / Patient</th>
                <th>Entity / Chamber</th>
                <th>Gross Fee</th>
                <th style={{ color: '#0284c7' }}>Medify Profit (৳20)</th>
                <th style={{ color: '#16a34a' }}>Your Net Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    No financial transaction records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isPaid = item.paymentStatus === 'paid';
                  const platformFee = 20;
                  const netPayout = isPaid ? item.grossAmount - platformFee : 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.referenceNo || item.id}</div>
                        <div className="text-xs text-muted">{item.date}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{item.title}</div>
                        <div className="text-xs text-muted">
                          {item.patientName} {item.patientPhone ? `• ${item.patientPhone}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-slate" style={{ fontSize: '0.75rem' }}>
                          {item.chamberOrDept || item.doctorName || item.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                          ৳{item.grossAmount.toLocaleString()}
                        </strong>
                        <div className="text-xs text-muted">{item.paymentMethod || 'Cash'}</div>
                      </td>
                      <td style={{ background: 'rgba(2, 132, 199, 0.03)' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#0284c7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          - ৳{platformFee}
                        </span>
                        <div className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Platform Fee</div>
                      </td>
                      <td style={{ background: 'rgba(22, 163, 74, 0.03)' }}>
                        <strong style={{ color: isPaid ? '#16a34a' : 'var(--slate-400)', fontSize: '0.95rem' }}>
                          {isPaid ? `৳${netPayout.toLocaleString()}` : '৳0 (Pending)'}
                        </strong>
                        <div className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>
                          {isPaid ? 'Net Disbursed' : 'Awaiting Payment'}
                        </div>
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge badge-success">Paid</span>
                        ) : item.paymentStatus === 'refunded' ? (
                          <span className="badge badge-slate">Refunded</span>
                        ) : (
                          <span className="badge badge-warning">Due / Unpaid</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
