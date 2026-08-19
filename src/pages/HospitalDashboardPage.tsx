import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctors, useStaff, useDiagnosticTests, useUpdateAppointmentStatus, useRecordPayment, useCreateDiagnosticTest } from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Building2, Plus, User, FileText, Edit, Trash2, Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import type { AppointmentStatus } from '../types';
import { Link } from 'react-router-dom';

export const HospitalDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const hospitalId = currentUser.hospitalId || 'HOSP-001';

  const { data: appointments = [], refetch } = useAppointments({ institutionId: hospitalId });
  const { data: allDoctors = [], refetch: refetchDoctors } = useDoctors();
  const { data: allTests = [], refetch: refetchTests } = useDiagnosticTests();

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();
  const createTestMutation = useCreateDiagnosticTest();

  const [activeTab, setActiveTab] = useState<'queue' | 'doctors' | 'tests'>('queue');
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Filters
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all'); // Doctor-wise filter
  const [searchQuery, setSearchQuery] = useState('');

  // Tests Tab Category Filter
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>('all');

  // Doctor CRUD State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('Cardiologist');
  const [docChamber, setDocChamber] = useState('Chamber 204');
  const [docFee, setDocFee] = useState(800);

  // Test CRUD State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState('Hematology');
  const [testPrice, setTestPrice] = useState(500);
  const [testSample, setTestSample] = useState('Whole Blood (EDTA)');

  const todayStr = new Date().toISOString().split('T')[0];

  const hospitalDoctors = allDoctors.filter((d) =>
    d.practiceLocations.some((loc) => loc.institutionId === hospitalId || loc.institutionName.toLowerCase().includes('ibn sina'))
  );

  const hospitalTests = allTests.filter((t) =>
    t.diagnosticCenterId === hospitalId || t.centerName?.toLowerCase().includes('ibn sina')
  );

  // Filtered Queue (Doctor-wise, Date-wise, Status-wise)
  const filteredAppointments = appointments.filter((a) => {
    // 1. Doctor-wise Filter
    if (selectedDoctorFilter !== 'all' && a.doctorId !== selectedDoctorFilter) {
      return false;
    }

    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.patientName.toLowerCase().includes(q) && !a.doctorName.toLowerCase().includes(q) && !String(a.serialNumber).includes(q)) {
        return false;
      }
    }

    // 3. Status Filter
    if (selectedStatusFilter !== 'all' && a.status !== selectedStatusFilter) {
      return false;
    }

    // 4. Exact Date Filter
    if (dateFilter && a.appointmentDate !== dateFilter) {
      return false;
    }

    // 5. Time Range Filter
    if (timeFilter === 'today' && a.appointmentDate !== todayStr) return false;
    if (timeFilter === 'upcoming' && (a.appointmentDate < todayStr || a.status === 'completed')) return false;
    if (timeFilter === 'past' && (a.appointmentDate >= todayStr && a.status !== 'completed')) return false;

    return true;
  });

  // Filtered Tests (Category-wise)
  const filteredHospitalTests = (hospitalTests.length > 0 ? hospitalTests : allTests.slice(0, 4)).filter((t) => {
    if (selectedTestCategory !== 'all' && t.category !== selectedTestCategory) {
      return false;
    }
    return true;
  });

  const handleNextStatus = async (id: string, currentStatus: AppointmentStatus) => {
    let next: AppointmentStatus = 'completed';
    if (currentStatus === 'booked') next = 'checked_in';
    else if (currentStatus === 'checked_in') next = 'waiting';
    else if (currentStatus === 'waiting') next = 'in_consultation';
    else if (currentStatus === 'in_consultation') next = 'completed';

    await updateStatusMutation.mutateAsync({ id, status: next });
    refetch();
  };

  const handleRecordPayment = async (id: string) => {
    await recordPaymentMutation.mutateAsync(id);
    refetch();
  };

  // Doctor CRUD handlers
  const handleOpenAddDoctor = () => {
    setEditingDoctorId(null);
    setDocName('');
    setDocSpec('Cardiologist');
    setDocChamber('Chamber 204');
    setDocFee(800);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: any) => {
    setEditingDoctorId(doc.id);
    setDocName(doc.name);
    setDocSpec(doc.specialization);
    const loc = doc.practiceLocations.find((l: any) => l.institutionId === hospitalId);
    setDocChamber(loc?.chamberName || 'Chamber 204');
    setDocFee(loc?.consultationFee || 800);
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
        phone: '+880 1711 000999',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        specialization: docSpec,
        qualifications: ['MBBS', 'FCPS'],
        experienceYears: 10,
        registrationNumber: `BMDC Reg #A-${Math.floor(10000 + Math.random() * 90000)}`,
        isVerified: true,
        about: 'Senior Consultant Physician conducting OPD chambers.',
        practiceLocations: [
          {
            id: `LOC-HOSP-00${allDoctors.length + 1}`,
            doctorId: `DOC-00${allDoctors.length + 1}`,
            institutionId: hospitalId,
            institutionName: 'Ibn Sina Specialized Hospital',
            locationType: 'hospital',
            chamberName: docChamber,
            address: 'House 48, Road 9/A, Dhanmondi',
            city: 'Dhaka',
            phone: '+880 2 9128835',
            consultationFee: Number(docFee),
            scheduleDays: ['Saturday', 'Monday', 'Wednesday'],
            startTime: '17:00',
            endTime: '21:00',
            dailyPatientLimit: 25,
            status: 'active',
          },
        ],
      });
    }
    setIsDoctorModalOpen(false);
    refetchDoctors();
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm('Remove doctor from hospital roster?')) {
      const idx = allDoctors.findIndex((d) => d.id === id);
      if (idx !== -1) allDoctors.splice(idx, 1);
      refetchDoctors();
    }
  };

  // Test CRUD handlers
  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestName('');
    setTestCategory('Hematology');
    setTestPrice(500);
    setTestSample('Whole Blood (EDTA)');
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (t: any) => {
    setEditingTestId(t.id);
    setTestName(t.name);
    setTestCategory(t.category);
    setTestPrice(t.price);
    setTestSample(t.sampleType);
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestId) {
      const target = allTests.find((t) => t.id === editingTestId);
      if (target) {
        target.name = testName;
        target.category = testCategory;
        target.price = Number(testPrice);
        target.sampleType = testSample;
      }
    } else {
      await createTestMutation.mutateAsync({
        diagnosticCenterId: hospitalId,
        name: testName,
        category: testCategory,
        price: Number(testPrice),
        sampleType: testSample,
        preparationInstructions: 'Routine lab testing guidelines apply.',
        homeCollectionAvailable: false,
      });
    }
    setIsTestModalOpen(false);
    refetchTests();
  };

  const handleDeleteTest = (id: string) => {
    if (window.confirm('Delete this diagnostic test from hospital catalog?')) {
      const idx = allTests.findIndex((t) => t.id === id);
      if (idx !== -1) allTests.splice(idx, 1);
      refetchTests();
    }
  };

  const handleResetFilters = () => {
    setTimeFilter('today');
    setDateFilter('');
    setSelectedStatusFilter('all');
    setSelectedDoctorFilter('all');
    setSelectedTestCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
      {/* Hospital Tenant Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={22} color="var(--primary-800)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ibn Sina Specialized Hospital Portal</h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            Hospital Administration • Doctor-Wise & Test-Wise Queue Filtering & Full CRUD
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={() => setIsManualBookingOpen(true)}>
            Manual OPD Booking
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
            Add Doctor
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddTest}>
            Add Test
          </Button>
        </div>
      </div>

      {/* Hospital Key Metrics */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Consultant Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{hospitalDoctors.length || 3}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>In-House Tests</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{hospitalTests.length || 4}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Today's OPD Queue</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{appointments.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Chambers</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>24</strong>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          OPD Queue & Appointments ({appointments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          Hospital Doctors Roster ({hospitalDoctors.length || 3})
        </button>
        <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          In-House Diagnostic Tests ({hospitalTests.length || 4})
        </button>
      </div>

      {/* Tab 1: Queue Control with Doctor-Wise & Date Filtering */}
      {activeTab === 'queue' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          {/* Queue Filter Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today's Queue ({appointments.filter((a) => a.appointmentDate === todayStr).length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Upcoming
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Past OPD
              </button>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Dates ({appointments.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Doctor-wise Filter Dropdown */}
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--primary-800)', borderColor: 'var(--primary-300)' }}
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              >
                <option value="all">Filter by Doctor (All)</option>
                {hospitalDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
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
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="checked_in">Checked In</option>
                <option value="waiting">Waiting</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
              </select>
              {(dateFilter || selectedStatusFilter !== 'all' || selectedDoctorFilter !== 'all' || timeFilter !== 'today' || searchQuery) && (
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
                  <th>Serial</th>
                  <th>Patient</th>
                  <th>Doctor & Chamber</th>
                  <th>Date & Time</th>
                  <th>Payment (Cash)</th>
                  <th>Status</th>
                  <th>Queue Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                      No OPD records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-800)' }}>#{apt.serialNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                        <div className="text-xs text-muted">{apt.patientPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.doctorName}</div>
                        <div className="text-xs text-muted">{apt.chamberName}</div>
                      </td>
                      <td>
                        <div>{apt.appointmentDate}</div>
                        <div className="text-xs text-muted">{apt.estimatedTime}</div>
                      </td>
                      <td>
                        {apt.paymentStatus === 'paid' ? (
                          <span className="badge badge-success">৳{apt.consultationFee} Paid</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleRecordPayment(apt.id)}>
                            Collect ৳{apt.consultationFee}
                          </Button>
                        )}
                      </td>
                      <td><StatusBadge status={apt.status} /></td>
                      <td>
                        {apt.status !== 'completed' && (
                          <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                            Advance →
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

      {/* Tab 2: Hospital Doctors CRUD */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Hospital Specialist Doctors</h2>
              <p className="text-xs text-muted">Add, Edit, and Manage consultant physicians in hospital chambers</p>
            </div>
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddDoctor}>
              Add Doctor
            </Button>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
            {(hospitalDoctors.length > 0 ? hospitalDoctors : allDoctors.slice(0, 3)).map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={doc.photoUrl} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                    <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                    <p className="text-xs text-muted">Chamber 204 • Fee: ৳800</p>
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

      {/* Tab 3: Hospital Diagnostic Tests CRUD & Category Filtering */}
      {activeTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>In-House Pathology & Diagnostic Tests</h2>
              <p className="text-xs text-muted">Filter tests by category or manage laboratory investigation catalog</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                value={selectedTestCategory}
                onChange={(e) => setSelectedTestCategory(e.target.value)}
              >
                <option value="all">All Categories ({hospitalTests.length || 4})</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology & Imaging">Radiology</option>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitalTests.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td><span className="badge badge-slate">{t.category}</span></td>
                    <td>{t.sampleType}</td>
                    <td><strong style={{ color: 'var(--primary-800)' }}>৳{t.price}</strong></td>
                    <td><span className="badge badge-success">Available</span></td>
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

      {/* Doctor Modal */}
      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title={editingDoctorId ? 'Edit Doctor Chamber' : 'Add Doctor to Hospital Roster'}>
        <form onSubmit={handleSaveDoctor}>
          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input type="text" required placeholder="e.g. Dr. Kazi Hasan Mahmud" className="form-input" value={docName} onChange={(e) => setDocName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization *</label>
            <input type="text" required placeholder="e.g. Orthopedic Surgeon" className="form-input" value={docSpec} onChange={(e) => setDocSpec(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Chamber Room *</label>
            <input type="text" required placeholder="e.g. Chamber 204 (Orthopedics)" className="form-input" value={docChamber} onChange={(e) => setDocChamber(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee (৳) *</label>
            <input type="number" required className="form-input" value={docFee} onChange={(e) => setDocFee(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDoctorModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingDoctorId ? 'Save Changes' : 'Add to Roster'}</Button>
          </div>
        </form>
      </Modal>

      {/* Test Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title={editingTestId ? 'Edit Pathology Test' : 'Add Diagnostic Test'}>
        <form onSubmit={handleSaveTest}>
          <div className="form-group">
            <label className="form-label">Test Name *</label>
            <input type="text" required placeholder="e.g. Serum Creatinine" className="form-input" value={testName} onChange={(e) => setTestName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <input type="text" required placeholder="e.g. Biochemistry" className="form-input" value={testCategory} onChange={(e) => setTestCategory(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sample Type *</label>
            <input type="text" required placeholder="e.g. Serum (Blood)" className="form-input" value={testSample} onChange={(e) => setTestSample(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (৳) *</label>
            <input type="number" required className="form-input" value={testPrice} onChange={(e) => setTestPrice(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingTestId ? 'Save Changes' : 'Add Test'}</Button>
          </div>
        </form>
      </Modal>

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedLocationId="LOC-001"
        onSuccess={() => refetch()}
      />
    </div>
  );
};
