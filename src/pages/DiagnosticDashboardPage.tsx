import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useDiagnosticOrders,
  useDiagnosticTests,
  useUpdateDiagnosticOrderStatus,
} from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { Stethoscope, Upload, CheckCircle2, Home, Building2 } from 'lucide-react';
import type { DiagnosticOrderStatus } from '../types';

export const DiagnosticDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const centerId = currentUser.diagnosticCenterId || 'DIAG-001';

  const { data: orders = [] } = useDiagnosticOrders({ centerId });
  const { data: tests = [] } = useDiagnosticTests({ centerId });
  const updateOrderStatusMutation = useUpdateDiagnosticOrderStatus();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [uploadModalOrder, setUploadModalOrder] = useState<any | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  const handleNextStatus = async (orderId: string, currentStatus: DiagnosticOrderStatus) => {
    let next: DiagnosticOrderStatus = 'report_ready';
    if (currentStatus === 'booked') next = 'accepted';
    else if (currentStatus === 'accepted') next = 'sample_collected';
    else if (currentStatus === 'sample_collected') next = 'processing';
    else if (currentStatus === 'processing') {
      const target = orders.find((o) => o.id === orderId);
      if (target) setUploadModalOrder(target);
      return;
    }

    await updateOrderStatusMutation.mutateAsync({ id: orderId, status: next });
  };

  const handleCompleteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalOrder) return;

    await updateOrderStatusMutation.mutateAsync({
      id: uploadModalOrder.id,
      status: 'report_ready',
      reportUrl: `https://medify247.com/mock-reports/${uploadModalOrder.id}.pdf`,
    });

    setUploadModalOrder(null);
  };

  return (
    <div className="container page-wrapper">
      {/* Diagnostic Center Tenant Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Stethoscope size={22} color="var(--accent-600)" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lab Aid Diagnostic Center</h1>
        </div>
        <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
          Tenant-Isolated Diagnostic Portal • Dhanmondi Branch
        </p>
      </div>

      {/* Pipeline Status Summary */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Total Orders</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{orders.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Pending Sample</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--warning-600)' }}>
            {orders.filter((o) => ['booked', 'accepted'].includes(o.status)).length}
          </strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Processing</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-700)' }}>
            {orders.filter((o) => o.status === 'processing' || o.status === 'sample_collected').length}
          </strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Ready</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>
            {orders.filter((o) => o.status === 'report_ready').length}
          </strong>
        </div>
      </div>

      {/* Diagnostic Orders & Sample Pipeline */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Orders & Sample Workflow</h2>
            <p className="text-xs text-muted">Manage sample collection & reports</p>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ fontSize: '0.8125rem' }}
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="booked">Booked</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">Processing</option>
              <option value="report_ready">Report Ready</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-800)' }}>{ord.orderNumber}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.patientName}</div>
                    <div className="text-xs text-muted">{ord.patientPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.testName}</div>
                    <div className="text-xs text-muted">৳{ord.testPrice} (Cash)</div>
                  </td>
                  <td>
                    {ord.bookingType === 'home_collection' ? (
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                        <Home size={11} /> Home
                      </span>
                    ) : (
                      <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                        <Building2 size={11} /> Walk-in
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={ord.status} />
                  </td>
                  <td>
                    {ord.status !== 'report_ready' && ord.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleNextStatus(ord.id, ord.status)}
                      >
                        {ord.status === 'processing' ? 'Upload PDF' : 'Advance →'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Report PDF Modal */}
      <Modal
        isOpen={!!uploadModalOrder}
        onClose={() => setUploadModalOrder(null)}
        title={`Upload Diagnostic Report: ${uploadModalOrder?.orderNumber}`}
        maxWidth="500px"
      >
        <form onSubmit={handleCompleteUpload}>
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
            Patient: <strong>{uploadModalOrder?.patientName}</strong> • Test: <strong>{uploadModalOrder?.testName}</strong>
          </p>

          <div
            style={{
              border: '2px dashed var(--primary-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--primary-50)',
              marginBottom: '1.25rem',
            }}
          >
            <Upload size={32} color="var(--primary-700)" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-900)' }}>
              Select Report PDF File
            </h4>
            <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
              Standard lab PDF format (simulated upload)
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Consultant Sign-off</label>
            <input
              type="text"
              required
              defaultValue="Dr. S. K. Roy (Consultant Biochemist)"
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setUploadModalOrder(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<CheckCircle2 size={16} />}>
              Publish & Deliver
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
