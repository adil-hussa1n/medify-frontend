import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useDiagnosticOrders,
  useDiagnosticTests,
  useDoctors,
  useUpdateDiagnosticOrderStatus,
  useCreateDiagnosticTest,
} from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { Stethoscope, Upload, CheckCircle2, Home, Building2, User, Plus, FileText, Activity } from 'lucide-react';
import type { DiagnosticOrderStatus } from '../types';

export const DiagnosticDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const centerId = currentUser.diagnosticCenterId || 'DIAG-001';

  const { data: orders = [] } = useDiagnosticOrders({ centerId });
  const { data: tests = [], refetch: refetchTests } = useDiagnosticTests({ centerId });
  const { data: allDoctors = [] } = useDoctors();

  const updateOrderStatusMutation = useUpdateDiagnosticOrderStatus();
  const createTestMutation = useCreateDiagnosticTest();

  // Tab State: orders, tests, doctors
  const [activeTab, setActiveTab] = useState<'orders' | 'tests' | 'doctors'>('orders');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [uploadModalOrder, setUploadModalOrder] = useState<any | null>(null);

  // New Test Modal State
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('Pathology');
  const [newTestPrice, setNewTestPrice] = useState(600);
  const [newTestSample, setNewTestSample] = useState('Blood');
  const [newTestInstructions, setNewTestInstructions] = useState('Fasting 8-10 hours required.');
  const [offersHome, setOffersHome] = useState(true);

  // Filter affiliated doctors having chambers in this diagnostic center
  const centerDoctors = allDoctors.filter((doc) =>
    doc.practiceLocations.some((loc) => loc.institutionId === centerId || loc.institutionName.toLowerCase().includes('lab aid') || loc.institutionName.toLowerCase().includes('diagnostic'))
  );

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

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTestMutation.mutateAsync({
      diagnosticCenterId: centerId,
      name: newTestName,
      category: newTestCategory,
      price: Number(newTestPrice),
      sampleType: newTestSample,
      preparationInstructions: newTestInstructions,
      homeCollectionAvailable: offersHome,
    });
    setIsNewTestModalOpen(false);
    setNewTestName('');
    refetchTests();
  };

  return (
    <div className="container page-wrapper">
      {/* Diagnostic Center Tenant Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Stethoscope size={22} color="var(--accent-600)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lab Aid Diagnostic Center</h1>
          </div>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
            Diagnostic & Clinical Pathology Hub • Consultation Chambers & Laboratory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={() => setIsNewTestModalOpen(true)}>
            Add New Test
          </Button>
        </div>
      </div>

      {/* Pipeline Status Summary */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Total Orders</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{orders.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Consultant Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{centerDoctors.length || 3}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Available Tests</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{tests.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Reports Ready</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>
            {orders.filter((o) => o.status === 'report_ready').length}
          </strong>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Orders & Samples ({orders.length})
        </button>
        <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          Offered Pathology Tests ({tests.length})
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          Chamber Doctors ({centerDoctors.length || 3})
        </button>
      </div>

      {/* Tab 1: Orders Pipeline */}
      {activeTab === 'orders' && (
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
      )}

      {/* Tab 2: Offered Pathology Tests Management */}
      {activeTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pathology & Diagnostic Catalog</h2>
              <p className="text-xs text-muted">Live tests available for patients to book online or walk-in</p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsNewTestModalOpen(true)}>
              Add Test
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Sample Type</th>
                  <th>Price (Cash)</th>
                  <th>Home Collection</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className="text-xs text-muted">{t.preparationInstructions}</div>
                    </td>
                    <td><span className="badge badge-slate">{t.category}</span></td>
                    <td>{t.sampleType}</td>
                    <td><strong style={{ color: 'var(--primary-800)' }}>৳{t.price}</strong></td>
                    <td>
                      {t.homeCollectionAvailable ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-slate">Walk-in Only</span>
                      )}
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Chamber Doctors */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Visiting Doctors & Consultation Chambers</h2>
            <p className="text-xs text-muted">Doctors practicing at Lab Aid Diagnostic Center chambers</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allDoctors.slice(0, 4).map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                  <p className="text-xs text-muted">Chamber 301 • Daily 6:00 PM - 9:00 PM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Add New Test Modal */}
      <Modal
        isOpen={isNewTestModalOpen}
        onClose={() => setIsNewTestModalOpen(false)}
        title="Add Diagnostic Pathology Test"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateTest}>
          <div className="form-group">
            <label className="form-label">Test Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Thyroid Stimulating Hormone (TSH)"
              className="form-input"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                required
                className="form-input"
                value={newTestCategory}
                onChange={(e) => setNewTestCategory(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price (BDT Cash)</label>
              <input
                type="number"
                required
                min="100"
                className="form-input"
                value={newTestPrice}
                onChange={(e) => setNewTestPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sample Type</label>
            <input
              type="text"
              placeholder="e.g. Blood (Serum) or Urine"
              className="form-input"
              value={newTestSample}
              onChange={(e) => setNewTestSample(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Patient Preparation Instructions</label>
            <input
              type="text"
              placeholder="e.g. 10-12 hours overnight fasting"
              className="form-input"
              value={newTestInstructions}
              onChange={(e) => setNewTestInstructions(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 1.25rem' }}>
            <input
              type="checkbox"
              id="homeCheck"
              checked={offersHome}
              onChange={(e) => setOffersHome(e.target.checked)}
            />
            <label htmlFor="homeCheck" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
              Available for Home Sample Collection
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsNewTestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create & Publish Test
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
