import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDiagnosticOrders } from '../hooks/useHealthcare';
import { useAuth } from '../context/AuthContext';
import { Button, StatusBadge } from '../components/ui/Core';
import { DiagnosticReportViewer } from '../components/domain/DiagnosticReportViewer';
import { Activity, FileText, Download, Calendar, Clock, MapPin, Building2, Home, Plus, ChevronRight, Eye, ChevronLeft } from 'lucide-react';

export const PatientReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const patientId = currentUser.patientId || 'PAT-001';

  const { data: orders = [], isLoading } = useDiagnosticOrders({ patientId });
  const [selectedReportOrder, setSelectedReportOrder] = useState<any | null>(null);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<any | null>(null);

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
    <div className="container page-wrapper" style={{ maxWidth: '880px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Diagnostic Orders & Reports</h1>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.85rem' }}>
            Track sample collection status, lab processing, and view/download official test reports.
          </p>
        </div>

        <Link to="/tests">
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
            Book New Test
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '130px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Activity size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No Diagnostic Orders Found</h3>
          <p className="text-sm text-muted" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>
            You haven't booked any diagnostic tests yet. Search our tests catalog to book walk-in or home collection.
          </p>
          <Link to="/tests">
            <Button variant="primary">Browse Diagnostic Tests</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {orders.map((order) => (
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

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-700)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} color="var(--primary-700)" /> {order.scheduledDate} ({order.timeSlot})
                  </span>
                  <span>
                    {order.bookingType === 'home_collection' ? (
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                        <Home size={11} /> Home Sample Collection
                      </span>
                    ) : (
                      <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                        <Building2 size={11} /> Walk-in
                      </span>
                    )}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    Fee: ৳{order.testPrice} (Cash)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '240px' }} className="mobile-full-width">
                {order.status === 'report_ready' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    style={{ width: '100%' }}
                    leftIcon={<Eye size={14} />}
                    onClick={() => setSelectedReportOrder(order)}
                  >
                    View & Download Report
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ width: '100%' }}
                    onClick={() => setSelectedTimelineOrder(order)}
                  >
                    View Status Timeline
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Status Modal */}
      {selectedTimelineOrder && (
        <div className="modal-overlay" onClick={() => setSelectedTimelineOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Order Status: #{selectedTimelineOrder.orderNumber}</h3>
              <button onClick={() => setSelectedTimelineOrder(null)} style={{ fontSize: '1.4rem' }}>&times;</button>
            </div>
            <div className="modal-body">
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                {selectedTimelineOrder.testName}
              </h4>
              <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                {selectedTimelineOrder.centerName}
              </p>

              {/* Status Timeline */}
              <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { key: 'booked', label: 'Order Confirmed', desc: 'Test booking is registered.' },
                  { key: 'sample_collected', label: 'Sample Collected', desc: 'Sample received by laboratory technologist.' },
                  { key: 'processing', label: 'Lab Analysis & Testing', desc: 'Pathology testing in progress.' },
                  { key: 'report_ready', label: 'Report Ready & Verified', desc: 'Verified by consultant pathologist.' },
                ].map((step, idx) => {
                  const isDone =
                    (step.key === 'booked' && ['booked', 'accepted', 'sample_collected', 'processing', 'report_ready'].includes(selectedTimelineOrder.status)) ||
                    (step.key === 'sample_collected' && ['sample_collected', 'processing', 'report_ready'].includes(selectedTimelineOrder.status)) ||
                    (step.key === 'processing' && ['processing', 'report_ready'].includes(selectedTimelineOrder.status)) ||
                    (step.key === 'report_ready' && selectedTimelineOrder.status === 'report_ready');

                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--success-500)' : 'var(--slate-200)',
                          color: 'var(--white)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--slate-900)' : 'var(--slate-500)', fontSize: '0.9rem' }}>
                          {step.label}
                        </div>
                        <div className="text-xs text-muted">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                <p><strong>Mode:</strong> {selectedTimelineOrder.bookingType === 'home_collection' ? 'Home Sample Collection' : 'Walk-in Diagnostic Center'}</p>
                <p><strong>Scheduled Date:</strong> {selectedTimelineOrder.scheduledDate} ({selectedTimelineOrder.timeSlot})</p>
                <p><strong>Fee:</strong> ৳{selectedTimelineOrder.testPrice} (Cash)</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="primary" style={{ width: '100%' }} onClick={() => setSelectedTimelineOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
