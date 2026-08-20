import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useAppointments,
  useDiagnosticOrders,
  useDiagnosticTests,
  useDoctors,
  useStaff,
  useUpdateAppointmentStatus,
  useUpdateDiagnosticOrderStatus,
  useRecordPayment,
  useCreateDiagnosticTest,
} from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { ManualLabOrderModal } from '../components/domain/ManualLabOrderModal';
import { Stethoscope, Upload, CheckCircle2, Home, Building2, User, Plus, FileText, Activity, Edit, Trash2, RotateCcw, Calendar, Search, Users, DollarSign, Receipt, FlaskConical, ClipboardList } from 'lucide-react';
import type { AppointmentStatus, DiagnosticOrderStatus } from '../types';
import { mockStaff } from '../api/mock/data';
import { FinancialReportView, FinancialItem } from '../components/domain/FinancialReportView';

export const DiagnosticDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const centerId = currentUser.diagnosticCenterId || 'DIAG-001';

  const { data: appointments = [], refetch: refetchAppointments } = useAppointments({ institutionId: centerId });
  const { data: orders = [], refetch: refetchOrders } = useDiagnosticOrders({ centerId });
  const { data: tests = [], refetch: refetchTests } = useDiagnosticTests({ centerId });
  const { data: allDoctors = [], refetch: refetchDoctors } = useDoctors();
  const { data: staffList = [], refetch: refetchStaff } = useStaff({ institutionId: centerId });

  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateOrderStatusMutation = useUpdateDiagnosticOrderStatus();
  const recordPaymentMutation = useRecordPayment();
  const createTestMutation = useCreateDiagnosticTest();

  // Tab State: orders, tests, doctors, staff, financials
  const [activeTab, setActiveTab] = useState<'orders' | 'tests' | 'doctors' | 'staff' | 'financials'>('orders');
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [isManualLabOrderOpen, setIsManualLabOrderOpen] = useState(false);

  // Doctors Sub Tab: 'queue' (Live Doctor Serials & Appointments) vs 'roster' (Doctor Roster Management)
  const [doctorSubTab, setDoctorSubTab] = useState<'queue' | 'roster'>('queue');
  const [docTimeFilter, setDocTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [docDateFilter, setDocDateFilter] = useState<string>('');
  const [docStatusFilter, setDocStatusFilter] = useState<string>('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Order Filters
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('all'); // Test-wise filter
  const [searchQuery, setSearchQuery] = useState('');

  // Tests Tab Category Filter
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>('all');

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

  // Staff CRUD State (Dedicated Doctor Assistant vs Test Staff)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRoleType, setStaffRoleType] = useState<'doctor_assistant' | 'test_manager'>('doctor_assistant');
  const [staffDesignation, setStaffDesignation] = useState<'Receptionist' | 'Lab Technician' | 'Sample Collector'>('Receptionist');
  const [staffDoctorAssignment, setStaffDoctorAssignment] = useState<string>('DOC-001');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter affiliated doctors having chambers in this diagnostic center
  const centerDoctors = allDoctors.filter((doc) =>
    doc.practiceLocations.some((loc) => loc.institutionId === centerId || loc.institutionName.toLowerCase().includes('lab aid') || loc.institutionName.toLowerCase().includes('diagnostic'))
  );

  // Filtered Orders (Test-wise, Date-wise, Status-wise)
  const filteredOrders = orders.filter((o) => {
    if (selectedTestFilter !== 'all' && o.testName !== selectedTestFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.patientName.toLowerCase().includes(q) && !o.testName.toLowerCase().includes(q) && !o.orderNumber.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) return false;
    if (dateFilter && o.scheduledDate !== dateFilter) return false;
    if (timeFilter === 'today' && o.scheduledDate !== todayStr) return false;
    if (timeFilter === 'upcoming' && (o.scheduledDate < todayStr || o.status === 'report_ready')) return false;
    if (timeFilter === 'past' && (o.scheduledDate >= todayStr && o.status !== 'report_ready')) return false;

    return true;
  });

  // Filtered Appointments (Doctor Serials & OPD Queue in Diagnostic Center)
  const filteredAppointments = appointments.filter((a) => {
    if (selectedDoctorFilter !== 'all' && a.doctorId !== selectedDoctorFilter) return false;
    if (docSearchQuery) {
      const q = docSearchQuery.toLowerCase();
      if (!a.patientName.toLowerCase().includes(q) && !a.doctorName.toLowerCase().includes(q) && !String(a.serialNumber).includes(q)) {
        return false;
      }
    }
    if (docStatusFilter !== 'all' && a.status !== docStatusFilter) return false;
    if (docDateFilter && a.appointmentDate !== docDateFilter) return false;
    if (docTimeFilter === 'today' && a.appointmentDate !== todayStr) return false;
    if (docTimeFilter === 'upcoming' && (a.appointmentDate < todayStr || a.status === 'completed')) return false;
    if (docTimeFilter === 'past' && (a.appointmentDate >= todayStr && a.status !== 'completed')) return false;

    return true;
  });

  const handleNextAppointmentStatus = async (id: string, currentStatus: AppointmentStatus) => {
    let next: AppointmentStatus = 'completed';
    if (currentStatus === 'booked') next = 'checked_in';
    else if (currentStatus === 'checked_in') next = 'waiting';
    else if (currentStatus === 'waiting') next = 'in_consultation';
    else if (currentStatus === 'in_consultation') next = 'completed';

    await updateStatusMutation.mutateAsync({ id, status: next });
    refetchAppointments();
  };

  const handleRecordDoctorPayment = async (id: string) => {
    await recordPaymentMutation.mutateAsync(id);
    refetchAppointments();
  };

  // Filtered Tests (Category-wise)
  const filteredTests = tests.filter((t) => {
    if (selectedTestCategory !== 'all' && t.category !== selectedTestCategory) return false;
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

  // Staff CRUD (Doctor Assistant vs Test Management)
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRoleType('doctor_assistant');
    setStaffDesignation('Receptionist');
    setStaffDoctorAssignment(centerDoctors[0]?.id || 'DOC-001');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: any) => {
    setEditingStaffId(stf.id);
    setStaffName(stf.name);
    setStaffRoleType(stf.assignedDoctorId ? 'doctor_assistant' : 'test_manager');
    setStaffDesignation(stf.designation);
    setStaffDoctorAssignment(stf.assignedDoctorId || centerDoctors[0]?.id || 'DOC-001');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const docObj = allDoctors.find((d) => d.id === staffDoctorAssignment);

    if (editingStaffId) {
      const target = mockStaff.find((s) => s.id === editingStaffId);
      if (target) {
        target.name = staffName;
        target.designation = staffDesignation;
        if (staffRoleType === 'doctor_assistant') {
          target.assignedDoctorId = staffDoctorAssignment;
          target.assignedDoctorName = docObj?.name;
        } else {
          target.assignedDoctorId = undefined;
          target.assignedDoctorName = undefined;
        }
      }
    } else {
      mockStaff.unshift({
        id: `STF-00${mockStaff.length + 1}`,
        userId: `USR-DSTF-00${mockStaff.length + 1}`,
        name: staffName,
        email: `${staffName.toLowerCase().replace(/[^a-z]/g, '')}@medify247.com`,
        phone: '+880 1711 000777',
        role: 'diagnostic_staff',
        designation: staffDesignation,
        institutionId: centerId,
        institutionName: 'Lab Aid Diagnostic Center',
        assignedDoctorId: staffRoleType === 'doctor_assistant' ? staffDoctorAssignment : undefined,
        assignedDoctorName: staffRoleType === 'doctor_assistant' ? docObj?.name : undefined,
        status: 'active',
      });
    }
    setIsStaffModalOpen(false);
    refetchStaff();
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Delete this staff member assignment?')) {
      const idx = mockStaff.findIndex((s) => s.id === id);
      if (idx !== -1) mockStaff.splice(idx, 1);
      refetchStaff();
    }
  };

  const handleResetFilters = () => {
    setTimeFilter('all');
    setDateFilter('');
    setSelectedStatusFilter('all');
    setSelectedTestFilter('all');
    setSelectedTestCategory('all');
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
            Diagnostic Hub • Sample Pipeline, Pathology Tests, Visiting Doctors & Staff Management CRUD
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" leftIcon={<FlaskConical size={15} />} onClick={() => setIsManualLabOrderOpen(true)}>
            Manual Lab Order
          </Button>
          <Button variant="accent" size="sm" leftIcon={<User size={14} />} onClick={() => setIsManualBookingOpen(true)}>
            Manual Doctor Serial
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={15} />} onClick={handleOpenAddTest}>
            Add Test
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
            Add Doctor
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddStaff}>
            Add Staff
          </Button>
        </div>
      </div>

      {/* Pipeline Status Summary */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Total Lab Orders</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{orders.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Doctor Serials Queue</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{appointments.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Pathology Tests</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{tests.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Staff Team</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>{staffList.length}</strong>
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
          Visiting Doctors & Live Serials ({appointments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
          Staff Management ({staffList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
          onClick={() => setActiveTab('financials')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <DollarSign size={14} />
          Financial Report & Medify Profit
        </button>
      </div>

      {/* Tab 1: Orders Pipeline with Test-Wise & Date Filtering */}
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
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--accent-700)', borderColor: 'var(--accent-300)' }}
                value={selectedTestFilter}
                onChange={(e) => setSelectedTestFilter(e.target.value)}
              >
                <option value="all">Filter by Test (All)</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

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
              {(dateFilter || selectedStatusFilter !== 'all' || selectedTestFilter !== 'all' || timeFilter !== 'all' || searchQuery) && (
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

      {/* Tab 2: Offered Pathology Tests CRUD & Category Filtering */}
      {activeTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pathology & Diagnostic Tests Catalog</h2>
              <p className="text-xs text-muted">Create, Edit, and Delete tests available for patient booking</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                value={selectedTestCategory}
                onChange={(e) => setSelectedTestCategory(e.target.value)}
              >
                <option value="all">All Categories ({tests.length})</option>
                <option value="Pathology">Pathology</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Cardiology">Cardiology</option>
              </select>

              <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddTest}>
                Add Test
              </Button>
            </div>
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
                {filteredTests.map((t) => (
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

      {/* Tab 3: Visiting Chamber Doctors & Live Serial Queue */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          {/* Sub-Tab Switcher: Live Doctor Serials Queue vs Visiting Doctor Roster */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${doctorSubTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDoctorSubTab('queue')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ClipboardList size={14} />
                Live Doctor Serials Queue ({appointments.length})
              </button>
              <button
                className={`btn btn-sm ${doctorSubTab === 'roster' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDoctorSubTab('roster')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={14} />
                Visiting Doctors Roster ({centerDoctors.length || 3})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" variant="accent" leftIcon={<User size={14} />} onClick={() => setIsManualBookingOpen(true)}>
                Manual Doctor Serial
              </Button>
              {doctorSubTab === 'roster' && (
                <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
                  Add Doctor
                </Button>
              )}
            </div>
          </div>

          {/* SUB-VIEW 1: LIVE DOCTOR SERIALS QUEUE */}
          {doctorSubTab === 'queue' && (
            <>
              {/* Doctor Serial Filter Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
                  <button className={`tab-btn ${docTimeFilter === 'today' ? 'active' : ''}`} onClick={() => setDocTimeFilter('today')}>
                    Today's Serials ({appointments.filter((a) => a.appointmentDate === todayStr).length})
                  </button>
                  <button className={`tab-btn ${docTimeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setDocTimeFilter('upcoming')}>
                    Upcoming
                  </button>
                  <button className={`tab-btn ${docTimeFilter === 'past' ? 'active' : ''}`} onClick={() => setDocTimeFilter('past')}>
                    Past
                  </button>
                  <button className={`tab-btn ${docTimeFilter === 'all' ? 'active' : ''}`} onClick={() => setDocTimeFilter('all')}>
                    All Dates ({appointments.length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--primary-800)', borderColor: 'var(--primary-300)' }}
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  >
                    <option value="all">Filter by Doctor (All)</option>
                    {centerDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialization})
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: '135px' }}
                    value={docDateFilter}
                    onChange={(e) => setDocDateFilter(e.target.value)}
                  />

                  <select
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                    value={docStatusFilter}
                    onChange={(e) => setDocStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="booked">Booked</option>
                    <option value="checked_in">Checked In</option>
                    <option value="waiting">Waiting</option>
                    <option value="in_consultation">In Consultation</option>
                    <option value="completed">Completed</option>
                  </select>

                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="Search patient or doctor..."
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem 0.35rem 1.6rem', width: '180px' }}
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                    />
                  </div>

                  {(docDateFilter || docStatusFilter !== 'all' || selectedDoctorFilter !== 'all' || docTimeFilter !== 'today' || docSearchQuery) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDocTimeFilter('today');
                        setDocDateFilter('');
                        setDocStatusFilter('all');
                        setSelectedDoctorFilter('all');
                        setDocSearchQuery('');
                      }}
                    >
                      <RotateCcw size={13} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Doctor Appointments Queue Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Serial</th>
                      <th>Patient</th>
                      <th>Visiting Doctor & Chamber</th>
                      <th>Date & Slot</th>
                      <th>Consultation Fee</th>
                      <th>Status</th>
                      <th>Queue Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                          No visiting doctor serial bookings found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <strong style={{ fontSize: '1.15rem', color: 'var(--primary-800)' }}>#{apt.serialNumber}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                            <div className="text-xs text-muted">{apt.patientPhone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{apt.doctorName}</div>
                            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                              {apt.chamberName || 'Consultation Floor'}
                            </span>
                          </td>
                          <td>
                            <div>{apt.appointmentDate}</div>
                            <div className="text-xs text-muted">{apt.estimatedTime}</div>
                          </td>
                          <td>
                            {apt.paymentStatus === 'paid' ? (
                              <span className="badge badge-success">৳{apt.consultationFee} Paid</span>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleRecordDoctorPayment(apt.id)}>
                                Collect ৳{apt.consultationFee}
                              </Button>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={apt.status} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {apt.status === 'booked' && (
                                <Button size="sm" variant="accent" onClick={() => handleNextAppointmentStatus(apt.id, apt.status)}>
                                  Check In
                                </Button>
                              )}
                              {apt.status === 'checked_in' && (
                                <Button size="sm" variant="primary" onClick={() => handleNextAppointmentStatus(apt.id, apt.status)}>
                                  Waiting
                                </Button>
                              )}
                              {apt.status === 'waiting' && (
                                <Button size="sm" variant="primary" onClick={() => handleNextAppointmentStatus(apt.id, apt.status)}>
                                  Call In →
                                </Button>
                              )}
                              {apt.status === 'in_consultation' && (
                                <Button size="sm" variant="secondary" onClick={() => handleNextAppointmentStatus(apt.id, apt.status)}>
                                  Finish ✓
                                </Button>
                              )}
                              {apt.status === 'completed' && (
                                <span className="badge badge-success">Consulted</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* SUB-VIEW 2: VISITING DOCTOR ROSTER */}
          {doctorSubTab === 'roster' && (
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
          )}
        </div>
      )}

      {/* Tab 4: Staff Management (Individual Doctor Assistants vs Laboratory Tests Staff) */}
      {activeTab === 'staff' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Diagnostic Center Staff Team</h2>
              <p className="text-xs text-muted">Separate staff members assigned to individual doctors vs pathology laboratory investigations</p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddStaff}>
              Assign New Staff
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Designation</th>
                  <th>Operational Assignment</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((stf) => (
                  <tr key={stf.id}>
                    <td>
                      <strong>{stf.name}</strong>
                      <div className="text-xs text-muted">{stf.email}</div>
                    </td>
                    <td><span className="badge badge-slate">{stf.designation}</span></td>
                    <td>
                      {stf.assignedDoctorId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={14} color="var(--primary-800)" />
                          <span style={{ fontWeight: 600, color: 'var(--primary-800)' }}>
                            Visiting Doctor Chamber: {stf.assignedDoctorName || 'Assigned Doctor'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Stethoscope size={14} color="var(--accent-600)" />
                          <span style={{ fontWeight: 600, color: 'var(--accent-700)' }}>
                            Pathology & Lab Tests Manager
                          </span>
                        </div>
                      )}
                    </td>
                    <td><span className="text-xs">{stf.phone}</span></td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditStaff(stf)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteStaff(stf.id)}>
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

      {/* TAB 5: FINANCIAL REPORT & MEDIFY PROFIT */}
      {activeTab === 'financials' && (
        <FinancialReportView
          title="Diagnostic Center Financial Report & Medify Profit"
          subtitle="Test orders, home sample collections, fee settlements & platform commission ledger"
          tenantName="Lab Aid Diagnostic Center"
          tenantType="diagnostic"
          items={orders.map((ord): FinancialItem => ({
            id: ord.id,
            type: 'diagnostic_test',
            title: ord.testName,
            patientName: ord.patientName,
            patientPhone: ord.patientPhone,
            referenceNo: ord.orderNumber,
            date: ord.scheduledDate,
            grossAmount: ord.testPrice || 0,
            medifyFee: 20,
            netAmount: (ord.testPrice || 0) - 20,
            paymentStatus: ord.paymentStatus === 'paid' ? 'paid' : 'unpaid',
            paymentMethod: ord.paymentMethod,
            category: ord.bookingType === 'home_collection' ? 'Home Sample Collection' : 'Walk-in Lab Visit',
          }))}
        />
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

      {/* Staff Assignment Modal */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={editingStaffId ? 'Edit Staff Member' : 'Assign Diagnostic Staff Member'}>
        <form onSubmit={handleSaveStaff}>
          <div className="form-group">
            <label className="form-label">Staff Full Name *</label>
            <input type="text" required placeholder="e.g. Nasir Uddin" className="form-input" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Staff Role Type *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="diagStaffType"
                  checked={staffRoleType === 'doctor_assistant'}
                  onChange={() => {
                    setStaffRoleType('doctor_assistant');
                    setStaffDesignation('Receptionist');
                  }}
                />
                Visiting Doctor Chamber Assistant
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="diagStaffType"
                  checked={staffRoleType === 'test_manager'}
                  onChange={() => {
                    setStaffRoleType('test_manager');
                    setStaffDesignation('Lab Technician');
                  }}
                />
                Pathology & Tests Manager
              </label>
            </div>
          </div>

          {staffRoleType === 'doctor_assistant' ? (
            <div className="form-group">
              <label className="form-label">Assign to Visiting Doctor *</label>
              <select
                className="form-select"
                value={staffDoctorAssignment}
                onChange={(e) => setStaffDoctorAssignment(e.target.value)}
              >
                {centerDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Laboratory Designation</label>
              <select
                className="form-select"
                value={staffDesignation}
                onChange={(e) => setStaffDesignation(e.target.value as any)}
              >
                <option value="Lab Technician">Lab Technician (Pathology)</option>
                <option value="Sample Collector">Phlebotomist / Sample Collector</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingStaffId ? 'Save Changes' : 'Assign Staff'}</Button>
          </div>
        </form>
      </Modal>
      <ManualLabOrderModal
        isOpen={isManualLabOrderOpen}
        onClose={() => setIsManualLabOrderOpen(false)}
        institutionId={centerId}
        institutionName="Lab Aid Diagnostic Center"
        onSuccess={() => refetchOrders()}
      />

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedLocationId="LOC-002"
        onSuccess={() => refetchAppointments()}
      />
    </div>
  );
};
