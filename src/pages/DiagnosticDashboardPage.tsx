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
import { Stethoscope, Upload, CheckCircle2, Home, Building2, User, Plus, FileText, Activity, Edit, Trash2, RotateCcw, Calendar, Search } from 'lucide-react';
import type { DiagnosticOrderStatus } from '../types';

export const DiagnosticDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const centerId = currentUser.diagnosticCenterId || 'DIAG-001';

  const { data: orders = [], refetch: refetchOrders } = useDiagnosticOrders({ centerId });
  const { data: tests = [], refetch: refetchTests } = useDiagnosticTests({ centerId });
  const { data: allDoctors = [], refetch: refetchDoctors } = useDoctors();

  const updateOrderStatusMutation = useUpdateDiagnosticOrderStatus();
  const createTestMutation = useCreateDiagnosticTest();

  // Tab State: orders, tests, doctors
  const [activeTab, setActiveTab] = useState<'orders' | 'tests' | 'doctors'>('orders');

  // Order Filters
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [uploadModalOrder, setUploadModalOrder] = useState<any | null>(null);

  // Test CRUD State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('Pathology');
  const [newTestPrice, setNewTestPrice] = useState(600);
  const [newTestSample, setNewTestSample] = useState('Blood');
  const [newTestInstructions, setNewTestInstructions] = useState('Fasting 8-10 hours required.');
  const [offersHome, setOffersHome] = useState(true);

  // Doctor Chamber CRUD State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('Cardiologist');
  const [docChamber, setDocChamber] = useState('Chamber 4 (Consultation Floor)');
  const [docFee, setDocFee] = useState(700);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter affiliated doctors having chambers in this diagnostic center
  const centerDoctors = allDoctors.filter((doc) =>
    doc.practiceLocations.some((loc) => loc.institutionId === centerId || loc.institutionName.toLowerCase().includes('lab aid') || loc.institutionName.toLowerCase().includes('diagnostic'))
  );

  const filteredOrders = orders.filter((o) => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.patientName.toLowerCase().includes(q) && !o.testName.toLowerCase().includes(q) && !o.orderNumber.toLowerCase().includes(q)) {
        return false;
      }
    }

    // 2. Status Filter
    if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) {
      return false;
    }

    // 3. Exact Date Filter
    if (dateFilter && o.scheduledDate !== dateFilter) {
      return false;
    }

    // 4. Time Range Filter
    if (timeFilter === 'today' && o.scheduledDate !== todayStr) return false;
    if (timeFilter === 'upcoming' && (o.scheduledDate < todayStr || o.status === 'report_ready')) return false;
    if (timeFilter === 'past' && (o.scheduledDate >= todayStr && o.status !== 'report_ready')) return false;

    return true;
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
    refetchOrders();
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
    refetchOrders();
  };

  // Test CRUD
  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setNewTestName('');
    setNewTestCategory('Pathology');
    setNewTestPrice(600);
    setNewTestSample('Blood');
    setNewTestInstructions('Fasting 8-10 hours required.');
    setOffersHome(true);
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (t: any) => {
    setEditingTestId(t.id);
    setNewTestName(t.name);
    setNewTestCategory(t.category);
    setNewTestPrice(t.price);
    setNewTestSample(t.sampleType);
    setNewTestInstructions(t.preparationInstructions);
    setOffersHome(t.homeCollectionAvailable);
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestId) {
      const target = tests.find((t) => t.id === editingTestId);
      if (target) {
        target.name = newTestName;
        target.category = newTestCategory;
        target.price = Number(newTestPrice);
        target.sampleType = newTestSample;
        target.preparationInstructions = newTestInstructions;
        target.homeCollectionAvailable = offersHome;
      }
    } else {
      await createTestMutation.mutateAsync({
        diagnosticCenterId: centerId,
        name: newTestName,
        category: newTestCategory,
        price: Number(newTestPrice),
        sampleType: newTestSample,
        preparationInstructions: newTestInstructions,
        homeCollectionAvailable: offersHome,
      });
    }
    setIsTestModalOpen(false);
    refetchTests();
  };

  const handleDeleteTest = (id: string) => {
    if (window.confirm('Delete this diagnostic test from center catalog?')) {
      const idx = tests.findIndex((t) => t.id === id);
      if (idx !== -1) tests.splice(idx, 1);
      refetchTests();
    }
  };

  // Doctor CRUD
  const handleOpenAddDoctor = () => {
    setEditingDoctorId(null);
    setDocName('');
    setDocSpec('Cardiologist');
    setDocChamber('Chamber 4 (Consultation Floor)');
    setDocFee(700);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: any) => {
    setEditingDoctorId(doc.id);
    setDocName(doc.name);
    setDocSpec(doc.specialization);
    const loc = doc.practiceLocations.find((l: any) => l.institutionId === centerId);
    setDocChamber(loc?.chamberName || 'Chamber 4');
    setDocFee(loc?.consultationFee || 700);
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctorId) {
      const target = allDoctors.find((d) => d.id === editingDoctorId);
      if (target) {
        target.name = docName;
        target.specialization = docSpec;
      }
    } else {
      allDoctors.unshift({
        id: `DOC-00${allDoctors.length + 1}`,
        userId: `USR-DOC-00${allDoctors.length + 1}`,
        name: docName,
        email: `${docName.toLowerCase().replace(/[^a-z]/g, '')}@medify247.com`,
        phone: '+880 1711 000888',
        photoUrl: 'https://images.unsplash.com/photo-1594824813689-1383b27b952b?w=300&auto=format&fit=crop&q=80',
        specialization: docSpec,
        qualifications: ['MBBS', 'MD'],
        experienceYears: 8,
        registrationNumber: `BMDC Reg #A-${Math.floor(10000 + Math.random() * 90000)}`,
        isVerified: true,
        about: 'Specialist Physician conducting consultation chambers at Lab Aid.',
        practiceLocations: [
          {
            id: `LOC-DIAG-00${allDoctors.length + 1}`,
            doctorId: `DOC-00${allDoctors.length + 1}`,
            institutionId: centerId,
            institutionName: 'Lab Aid Diagnostic Center',
            locationType: 'diagnostic_center',
            chamberName: docChamber,
            address: 'House 01, Road 04, Dhanmondi',
            city: 'Dhaka',
            phone: '+880 2 8610793',
            consultationFee: Number(docFee),
            scheduleDays: ['Sunday', 'Tuesday', 'Thursday'],
            startTime: '18:00',
            endTime: '21:00',
            dailyPatientLimit: 20,
            status: 'active',
          },
        ],
      });
    }
    setIsDoctorModalOpen(false);
    refetchDoctors();
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm('Remove doctor from diagnostic chamber roster?')) {
      const idx = allDoctors.findIndex((d) => d.id === id);
      if (idx !== -1) allDoctors.splice(idx, 1);
      refetchDoctors();
    }
  };

  const handleResetFilters = () => {
    setTimeFilter('all');
    setDateFilter('');
    setSelectedStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
      {/* Diagnostic Center Tenant Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Stethoscope size={22} color="var(--accent-600)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lab Aid Diagnostic Center Portal</h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            Diagnostic & Clinical Pathology Hub • Sample Pipeline, Pathology Tests & Visiting Doctors CRUD
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={handleOpenAddTest}>
            Add Test
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
            Add Doctor
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
          <span className="text-xs text-muted" style={{ display: 'block' }}>Chamber Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{centerDoctors.length || 3}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Pathology Tests</span>
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
      <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Orders & Sample Pipeline ({orders.length})
        </button>
        <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          Offered Pathology Tests ({tests.length})
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          Visiting Chamber Doctors ({centerDoctors.length || 3})
        </button>
      </div>

      {/* Tab 1: Orders Pipeline with Date Filtering */}
      {activeTab === 'orders' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          {/* Order Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Orders ({orders.length})
              </button>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today's Samples ({orders.filter((o) => o.scheduledDate === todayStr).length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Pending / Processing
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Completed Reports
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: '135px' }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="booked">Booked</option>
                <option value="accepted">Accepted</option>
                <option value="sample_collected">Sample Collected</option>
                <option value="processing">Processing</option>
                <option value="report_ready">Report Ready</option>
              </select>
              {(dateFilter || selectedStatusFilter !== 'all' || timeFilter !== 'all' || searchQuery) && (
                <Button size="sm" variant="outline" onClick={handleResetFilters}>
                  <RotateCcw size={13} />
                </Button>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Investigation Test</th>
                  <th>Collection Type</th>
                  <th>Sample Date</th>
                  <th>Status</th>
                  <th>Lab Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                      No diagnostic orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td><strong style={{ color: 'var(--primary-800)' }}>{ord.orderNumber}</strong></td>
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
                        <div>{ord.scheduledDate}</div>
                        <div className="text-xs text-muted">{ord.timeSlot}</div>
                      </td>
                      <td><StatusBadge status={ord.status} /></td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Offered Pathology Tests CRUD */}
      {activeTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pathology & Diagnostic Tests Catalog</h2>
              <p className="text-xs text-muted">Create, Edit, and Delete tests available for patient booking</p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddTest}>
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
                  <th>Actions</th>
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
                        <span className="badge badge-accent">Available</span>
                      ) : (
                        <span className="badge badge-slate">Walk-in Only</span>
                      )}
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditTest(t)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteTest(t.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Chamber Doctors CRUD */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Visiting Chamber Doctors</h2>
              <p className="text-xs text-muted">Specialist physicians holding daily consultation chambers</p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
              Add Doctor
            </Button>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
            {(centerDoctors.length > 0 ? centerDoctors : allDoctors.slice(0, 3)).map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={doc.photoUrl} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                    <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                    <p className="text-xs text-muted">Chamber 4 • Fee: ৳700</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem' }}>
                  <Button size="sm" variant="outline" style={{ flex: 1 }} leftIcon={<Edit size={13} />} onClick={() => handleOpenEditDoctor(doc)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" leftIcon={<Trash2 size={13} />} onClick={() => handleDeleteDoctor(doc.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      <Modal isOpen={!!uploadModalOrder} onClose={() => setUploadModalOrder(null)} title="Sign & Upload Diagnostic Report">
        <form onSubmit={handleCompleteUpload}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{uploadModalOrder?.testName}</h4>
            <p className="text-xs text-muted">Order #{uploadModalOrder?.orderNumber} • Patient: {uploadModalOrder?.patientName}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Attach Lab PDF Report (Mock Auto-Attached)</label>
            <div style={{ border: '2px dashed var(--slate-300)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <Upload size={24} color="var(--primary-800)" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-xs" style={{ fontWeight: 600 }}>Click or Drag PDF here to finalize report</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setUploadModalOrder(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Sign & Publish Report</Button>
          </div>
        </form>
      </Modal>

      {/* Test Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title={editingTestId ? 'Edit Diagnostic Test' : 'Add Diagnostic Test'}>
        <form onSubmit={handleSaveTest}>
          <div className="form-group">
            <label className="form-label">Test Name *</label>
            <input type="text" required placeholder="e.g. Complete Blood Count (CBC)" className="form-input" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <input type="text" required placeholder="e.g. Hematology" className="form-input" value={newTestCategory} onChange={(e) => setNewTestCategory(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sample Type *</label>
            <input type="text" required placeholder="e.g. Whole Blood" className="form-input" value={newTestSample} onChange={(e) => setNewTestSample(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (৳) *</label>
            <input type="number" required className="form-input" value={newTestPrice} onChange={(e) => setNewTestPrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Preparation Instructions</label>
            <input type="text" className="form-input" value={newTestInstructions} onChange={(e) => setNewTestInstructions(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="homeCol" checked={offersHome} onChange={(e) => setOffersHome(e.target.checked)} />
            <label htmlFor="homeCol" className="text-xs" style={{ cursor: 'pointer' }}>Available for Home Sample Collection</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingTestId ? 'Save Changes' : 'Add Test'}</Button>
          </div>
        </form>
      </Modal>

      {/* Doctor Modal */}
      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title={editingDoctorId ? 'Edit Doctor Chamber' : 'Add Visiting Doctor'}>
        <form onSubmit={handleSaveDoctor}>
          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input type="text" required placeholder="e.g. Dr. Syed Tanveer Ahmed" className="form-input" value={docName} onChange={(e) => setDocName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization *</label>
            <input type="text" required placeholder="e.g. Neurologist" className="form-input" value={docSpec} onChange={(e) => setDocSpec(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Chamber Room *</label>
            <input type="text" required placeholder="e.g. Chamber 4" className="form-input" value={docChamber} onChange={(e) => setDocChamber(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee (৳) *</label>
            <input type="number" required className="form-input" value={docFee} onChange={(e) => setDocFee(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDoctorModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingDoctorId ? 'Save Changes' : 'Add to Chamber'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
