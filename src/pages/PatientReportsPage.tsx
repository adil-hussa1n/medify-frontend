import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDiagnosticOrders } from '../hooks/useHealthcare';
import { useAuth } from '../context/AuthContext';
import { Button, StatusBadge } from '../components/ui/Core';
import { DiagnosticReportViewer } from '../components/domain/DiagnosticReportViewer';
import { Activity, FileText, Download, Calendar, Clock, MapPin, Building2, Home, Plus, ChevronRight, Eye, ChevronLeft, RotateCcw } from 'lucide-react';

export const PatientReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const patientId = currentUser.patientId || 'PAT-001';

  const { data: orders = [], isLoading } = useDiagnosticOrders({ patientId });
  const [selectedReportOrder, setSelectedReportOrder] = useState<any | null>(null);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<any | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering States
  const [timeFilter, setTimeFilter] = useState<'all' | 'ready' | 'in_progress' | 'scheduled'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    // 1. Date Filter
    if (dateFilter && order.scheduledDate !== dateFilter) {
      return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // 3. Time / Readiness Filter
    if (timeFilter === 'ready') {
      return order.status === 'report_ready';
    }
    if (timeFilter === 'in_progress') {
      return ['accepted', 'sample_collected', 'processing'].includes(order.status);
    }
    if (timeFilter === 'scheduled') {
      return order.status === 'booked';
    }

    return true;
  });

  const handleResetFilters = () => {
    setTimeFilter('all');
    setDateFilter('');
    setStatusFilter('all');
  };

  // If viewing a specific report via URL parameter or selection
  const viewedOrder = (id ? orders.find((o) => o.id === id) : null) || selectedReportOrder;

  if (viewedOrder) {
    return (
      <div className="container page-wrapper" style={{ maxWidth: '880px' }}>
        <button
          onClick={() => {
            setSelectedReportOrder(null);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-600)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <ChevronLeft size={16} /> Back to Reports & Orders
        </button>
        <DiagnosticReportViewer order={viewedOrder} onClose={() => setSelectedReportOrder(null)} />
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: '920px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Diagnostic Orders & Reports</h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            Filter by test date, sample status, and view/download instant pathology sheets.
          </p>
        </div>

        <Link to="/tests">
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
            Book New Test
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
              All Tests ({orders.length})
            </button>
            <button className={`tab-btn ${timeFilter === 'ready' ? 'active' : ''}`} onClick={() => setTimeFilter('ready')}>
              Reports Ready ({orders.filter((o) => o.status === 'report_ready').length})
            </button>
            <button className={`tab-btn ${timeFilter === 'in_progress' ? 'active' : ''}`} onClick={() => setTimeFilter('in_progress')}>
              In Progress ({orders.filter((o) => ['accepted', 'sample_collected', 'processing'].includes(o.status)).length})
            </button>
            <button className={`tab-btn ${timeFilter === 'scheduled' ? 'active' : ''}`} onClick={() => setTimeFilter('scheduled')}>
              Scheduled / Booked ({orders.filter((o) => o.status === 'booked').length})
            </button>
          </div>

          {(dateFilter || statusFilter !== 'all' || timeFilter !== 'all') && (
            <Button size="sm" variant="outline" leftIcon={<RotateCcw size={13} />} onClick={handleResetFilters}>
              Reset
            </Button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)' }}>
          <div>
            <label className="form-label text-xs">Filter by Test Date</label>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-xs">Filter by Pipeline Status</label>
            <select
              className="form-select"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Pipeline Stages</option>
              <option value="booked">Booked (Pending Sample)</option>
              <option value="accepted">Accepted</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">Lab Processing</option>
              <option value="report_ready">Report Ready & Signed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '130px' }} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Diagnostic Orders Found</h3>
          <p className="text-xs text-muted" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>
            {dateFilter || statusFilter !== 'all' || timeFilter !== 'all'
              ? 'No test orders matched your selected filter parameters.'
              : 'Search our diagnostic catalog to book tests online with instant sample tracking.'}
          </p>
          {dateFilter || statusFilter !== 'all' || timeFilter !== 'all' ? (
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          ) : (
            <Link to="/tests">
              <Button size="sm" variant="primary">Browse Tests</Button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="card card-hover"
              style={{
                padding: '1.15rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {order.testName}
                  </h3>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  🏥 {order.centerName} • Order #{order.orderNumber}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--slate-700)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} color="var(--primary-700)" /> {order.scheduledDate} ({order.timeSlot})
                  </span>
                  <span>
                    {order.bookingType === 'home_collection' ? (
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                        <Home size={11} /> Home Sample
                      </span>
                    ) : (
                      <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                        <Building2 size={11} /> Walk-in
                      </span>
                    )}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ৳{order.testPrice} (Cash)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '250px' }} className="mobile-full-width">
                <Button
                  size="sm"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedTimelineOrder(selectedTimelineOrder?.id === order.id ? null : order)}
                >
                  {selectedTimelineOrder?.id === order.id ? 'Hide Pipeline' : 'Pipeline'}
                </Button>

                {order.status === 'report_ready' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    style={{ flex: 1 }}
                    leftIcon={<FileText size={14} />}
                    onClick={() => setSelectedReportOrder(order)}
                  >
                    View Report
                  </Button>
                ) : (
                  <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', padding: '0.4rem 0.65rem', flex: 1, justifyContent: 'center' }}>
                    Lab Processing
                  </span>
                )}
              </div>

              {/* Sample Timeline Expansion */}
              {selectedTimelineOrder?.id === order.id && (
                <div
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    marginTop: '0.75rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Sample & Report Pipeline
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Booked', 'Sample Collected', 'Lab Analysis', 'Report Ready'].map((step, idx) => {
                      const isDone =
                        (idx === 0 && ['booked', 'accepted', 'sample_collected', 'processing', 'report_ready'].includes(order.status)) ||
                        (idx === 1 && ['sample_collected', 'processing', 'report_ready'].includes(order.status)) ||
                        (idx === 2 && ['processing', 'report_ready'].includes(order.status)) ||
                        (idx === 3 && order.status === 'report_ready');

                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? 'var(--primary-800)' : 'var(--slate-300)',
                              color: 'var(--white)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </div>
                          <span style={{ color: isDone ? 'var(--slate-900)' : 'var(--slate-400)', fontWeight: isDone ? 600 : 400 }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
