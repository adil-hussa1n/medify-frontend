import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useAppointments,
  useDoctor,
  useDoctors,
  useDiagnosticOrders,
  useDiagnosticTests,
  useStaff,
  useUpdateAppointmentStatus,
  useUpdateDiagnosticOrderStatus,
  useRecordPayment,
} from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, Phone, Stethoscope, Building2, User, FileText, CheckCircle2, RotateCcw, Calendar, Edit, Trash2, Search, Users } from 'lucide-react';
import type { AppointmentStatus, DiagnosticOrderStatus, Staff } from '../types';
import { mockStaff } from '../api/mock/data';

export const StaffDashboardPage: React.FC<{ staffType: 'doctor_staff' | 'hospital_staff' | 'diagnostic_staff' }> = ({
  staffType,
}) => {
  const { currentUser } = useAuth();
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<'queue' | 'doctors' | 'tests' | 'staff_team'>('queue');

  // Scoped Entity IDs
  const assignedDoctorId = currentUser.assignedDoctorId || 'DOC-001';
  const { data: assignedDoctor } = useDoctor(assignedDoctorId);

  const hospitalId = currentUser.hospitalId || 'HOSP-001';
  const diagnosticCenterId = currentUser.diagnosticCenterId || 'DIAG-001';

  // Live Queries
  const { data: allAppointments = [], refetch: refetchAppointments } = useAppointments({
    doctorId: staffType === 'doctor_staff' ? assignedDoctorId : undefined,
    institutionId: staffType === 'hospital_staff' ? hospitalId : undefined,
  });

  const { data: diagnosticOrders = [], refetch: refetchDiagnostic } = useDiagnosticOrders({
    centerId: staffType === 'diagnostic_staff' ? diagnosticCenterId : undefined,
  });

  const { data: allDoctors = [] } = useDoctors();
  const { data: allTests = [] } = useDiagnosticTests();
  const { data: staffList = [], refetch: refetchStaff } = useStaff({
    institutionId: staffType === 'hospital_staff' ? hospitalId : staffType === 'diagnostic_staff' ? diagnosticCenterId : undefined,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateDiagnosticStatusMutation = useUpdateDiagnosticOrderStatus();
  const recordPaymentMutation = useRecordPayment();

  // Filters
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff CRUD Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRoleType, setStaffRoleType] = useState<'doctor_assistant' | 'test_manager'>('doctor_assistant');
  const [staffDesignation, setStaffDesignation] = useState<'Receptionist' | 'Lab Technician' | 'Assistant'>('Receptionist');
  const [staffDoctorAssignment, setStaffDoctorAssignment] = useState<string>('DOC-001');

  const todayStr = new Date().toISOString().split('T')[0];

  // Scoped Doctors & Tests
  const scopedDoctors =
    staffType === 'doctor_staff'
      ? assignedDoctor ? [assignedDoctor] : []
      : staffType === 'hospital_staff'
      ? allDoctors.filter((d) => d.practiceLocations.some((loc) => loc.institutionId === hospitalId || loc.institutionName.toLowerCase().includes('ibn sina')))
      : allDoctors.filter((d) => d.practiceLocations.some((loc) => loc.institutionId === diagnosticCenterId || loc.institutionName.toLowerCase().includes('lab aid')));

  const scopedTests =
    staffType === 'hospital_staff'
      ? allTests.filter((t) => t.diagnosticCenterId === hospitalId || t.centerName?.toLowerCase().includes('ibn sina'))
      : allTests.filter((t) => t.diagnosticCenterId === diagnosticCenterId || t.centerName?.toLowerCase().includes('lab aid'));

  // Filtered Appointments (Doctor-wise, Date-wise, Status-wise)
  const filteredAppointments = allAppointments.filter((apt) => {
    if (doctorFilter !== 'all' && apt.doctorId !== doctorFilter) return false;
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (dateFilter && apt.appointmentDate !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!apt.patientName.toLowerCase().includes(q) && !apt.doctorName.toLowerCase().includes(q) && !String(apt.serialNumber).includes(q)) {
        return false;
      }
    }
    if (timeFilter === 'today' && apt.appointmentDate !== todayStr) return false;
    if (timeFilter === 'upcoming' && (apt.appointmentDate < todayStr || apt.status === 'completed')) return false;
    if (timeFilter === 'past' && (apt.appointmentDate >= todayStr && apt.status !== 'completed')) return false;

    return true;
  });

  // Filtered Diagnostic Orders (Test-wise, Date-wise, Status-wise)
  const filteredOrders = diagnosticOrders.filter((ord) => {
    if (testFilter !== 'all' && ord.testName !== testFilter) return false;
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (dateFilter && ord.scheduledDate !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!ord.patientName.toLowerCase().includes(q) && !ord.testName.toLowerCase().includes(q) && !ord.orderNumber.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (timeFilter === 'today' && ord.scheduledDate !== todayStr) return false;
    if (timeFilter === 'upcoming' && (ord.scheduledDate < todayStr || ord.status === 'report_ready')) return false;
    if (timeFilter === 'past' && (ord.scheduledDate >= todayStr && ord.status !== 'report_ready')) return false;

    return true;
  });

  const handleNextStatus = async (id: string, currentStatus: AppointmentStatus) => {
    let next: AppointmentStatus = 'completed';
    if (currentStatus === 'booked') next = 'checked_in';
    else if (currentStatus === 'checked_in') next = 'waiting';
    else if (currentStatus === 'waiting') next = 'in_consultation';
    else if (currentStatus === 'in_consultation') next = 'completed';

    await updateStatusMutation.mutateAsync({ id, status: next });
    refetchAppointments();
  };

  const handleNextDiagnosticStatus = async (orderId: string, currentStatus: DiagnosticOrderStatus) => {
    let next: DiagnosticOrderStatus = 'report_ready';
    if (currentStatus === 'booked') next = 'accepted';
    else if (currentStatus === 'accepted') next = 'sample_collected';
    else if (currentStatus === 'sample_collected') next = 'processing';
    else if (currentStatus === 'processing') next = 'report_ready';

    await updateDiagnosticStatusMutation.mutateAsync({ id: orderId, status: next });
    refetchDiagnostic();
  };

  const handleRecordPayment = async (id: string) => {
    await recordPaymentMutation.mutateAsync(id);
    refetchAppointments();
  };

  // Staff CRUD Operations
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRoleType('doctor_assistant');
    setStaffDesignation('Receptionist');
    setStaffDoctorAssignment(scopedDoctors[0]?.id || 'DOC-001');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: any) => {
    setEditingStaffId(stf.id);
    setStaffName(stf.name);
    setStaffDesignation(stf.designation);
    setStaffDoctorAssignment(stf.assignedDoctorId || scopedDoctors[0]?.id || 'DOC-001');
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
        }
      }
    } else {
      mockStaff.unshift({
        id: `STF-00${mockStaff.length + 1}`,
        userId: `USR-STF-00${mockStaff.length + 1}`,
        name: staffName,
        email: `${staffName.toLowerCase().replace(/[^a-z]/g, '')}@medify247.com`,
        phone: '+880 1811 000999',
        role: staffType === 'doctor_staff' ? 'doctor_staff' : staffType === 'hospital_staff' ? 'hospital_staff' : 'diagnostic_staff',
        designation: staffDesignation,
        institutionId: staffType === 'hospital_staff' ? hospitalId : staffType === 'diagnostic_staff' ? diagnosticCenterId : undefined,
        institutionName: staffType === 'hospital_staff' ? 'Ibn Sina Hospital' : staffType === 'diagnostic_staff' ? 'Lab Aid Diagnostic' : undefined,
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
    setTimeFilter('today');
    setDateFilter('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setTestFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
      {/* Scoped Entity Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {staffType === 'doctor_staff' ? (
              <User size={22} color="var(--primary-800)" />
            ) : staffType === 'hospital_staff' ? (
              <Building2 size={22} color="var(--primary-800)" />
            ) : (
              <Stethoscope size={22} color="var(--accent-600)" />
            )}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {staffType === 'doctor_staff'
                ? `Assistant to ${assignedDoctor?.name || 'Assigned Doctor'}`
                : staffType === 'hospital_staff'
                ? 'Ibn Sina Hospital — Staff & Reception Operations'
                : 'Lab Aid Diagnostic — Lab Testing & Doctor Chamber Desk'}
            </h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            {currentUser.name} • {staffType === 'doctor_staff' ? 'Doctor Assistant Scope' : staffType === 'hospital_staff' ? 'Tenant: Ibn Sina Specialized Hospital' : 'Tenant: Lab Aid Diagnostic Center'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsManualBookingOpen(true)}
          >
            Manual Booking
          </Button>
          {staffType !== 'doctor_staff' && (
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddStaff}>
              Add Staff Member
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab-btn ${staffTab === 'queue' ? 'active' : ''}`} onClick={() => setStaffTab('queue')}>
          {staffType === 'diagnostic_staff' ? `Sample Orders (${diagnosticOrders.length})` : `Patient Queue (${allAppointments.length})`}
        </button>
        {staffType !== 'doctor_staff' && (
          <>
            <button className={`tab-btn ${staffTab === 'doctors' ? 'active' : ''}`} onClick={() => setStaffTab('doctors')}>
              Facility Doctors ({scopedDoctors.length})
            </button>
            <button className={`tab-btn ${staffTab === 'tests' ? 'active' : ''}`} onClick={() => setStaffTab('tests')}>
              Facility Tests ({scopedTests.length})
            </button>
            <button className={`tab-btn ${staffTab === 'staff_team' ? 'active' : ''}`} onClick={() => setStaffTab('staff_team')}>
              Staff Team & Doctor Assignments ({staffList.length})
            </button>
          </>
        )}
      </div>

      {/* 1. DOCTOR STAFF VIEW / HOSPITAL STAFF OPD QUEUE */}
      {(staffType === 'doctor_staff' || (staffType === 'hospital_staff' && staffTab === 'queue')) && (
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Filtering Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today ({allAppointments.filter((a) => a.appointmentDate === todayStr).length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Upcoming
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Past OPD
              </button>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Dates ({allAppointments.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {staffType === 'hospital_staff' && (
                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--primary-800)' }}
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                >
                  <option value="all">Doctor (All)</option>
                  {scopedDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              )}

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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="checked_in">Checked In</option>
                <option value="waiting">Waiting</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
              </select>
              {(dateFilter || statusFilter !== 'all' || doctorFilter !== 'all' || timeFilter !== 'today' || searchQuery) && (
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
                  <th>Patient Details</th>
                  <th>Doctor / Chamber</th>
                  <th>Date & Time</th>
                  <th>Payment (Cash)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                      No appointment records found for selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-800)' }}>#{apt.serialNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                        <div className="text-xs text-muted"><Phone size={11} style={{ display: 'inline', marginRight: '3px' }} />{apt.patientPhone}</div>
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
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {apt.status === 'booked' && (
                            <Button size="sm" variant="accent" onClick={() => handleNextStatus(apt.id, apt.status)}>
                              Check In
                            </Button>
                          )}
                          {apt.status === 'checked_in' && (
                            <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                              Move Waiting
                            </Button>
                          )}
                          {apt.status === 'waiting' && (
                            <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                              Call In →
                            </Button>
                          )}
                          {apt.status === 'in_consultation' && (
                            <Button size="sm" variant="secondary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                              Complete ✓
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DIAGNOSTIC STAFF VIEW: Orders Pipeline with Test-wise Filtering */}
      {staffType === 'diagnostic_staff' && staffTab === 'queue' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Orders ({diagnosticOrders.length})
              </button>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today's Orders ({diagnosticOrders.filter((o) => o.scheduledDate === todayStr).length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Pending
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Ready
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--accent-700)' }}
                value={testFilter}
                onChange={(e) => setTestFilter(e.target.value)}
              >
                <option value="all">Test (All)</option>
                {scopedTests.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="booked">Booked</option>
                <option value="accepted">Accepted</option>
                <option value="sample_collected">Sample Collected</option>
                <option value="processing">Processing</option>
                <option value="report_ready">Report Ready</option>
              </select>
              {(dateFilter || statusFilter !== 'all' || testFilter !== 'all' || timeFilter !== 'all' || searchQuery) && (
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
                  <th>Type</th>
                  <th>Date & Slot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                      No test orders match your filter criteria.
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
                      <td><span className="badge badge-slate">{ord.bookingType}</span></td>
                      <td>
                        <div>{ord.scheduledDate}</div>
                        <div className="text-xs text-muted">{ord.timeSlot}</div>
                      </td>
                      <td><StatusBadge status={ord.status} /></td>
                      <td>
                        {ord.status !== 'report_ready' && (
                          <Button size="sm" variant="primary" onClick={() => handleNextDiagnosticStatus(ord.id, ord.status)}>
                            Advance Pipeline →
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

      {/* 3. STAFF TEAM & ASSIGNMENTS CRUD (Individual Doctor Assistants vs Test Managers) */}
      {staffTab === 'staff_team' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Staff Team & Operational Roles</h2>
              <p className="text-xs text-muted">Manage individual staff for specific doctors and separate staff for laboratory tests</p>
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
                  <th>Contact</th>
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
                            Assigned to: {stf.assignedDoctorName || 'Doctor Chamber'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Stethoscope size={14} color="var(--accent-600)" />
                          <span style={{ fontWeight: 600, color: 'var(--accent-700)' }}>
                            Tests & Laboratory Manager
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

      {/* Facility Doctors Tab */}
      {staffType !== 'doctor_staff' && staffTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Facility Doctors Roster ({scopedDoctors.length} Specialists)
          </h2>
          <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
            {scopedDoctors.map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--slate-50)' }}>
                <img src={doc.photoUrl} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                  <p className="text-xs text-muted">Chamber 204 • Fee: ৳800</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facility Tests Tab */}
      {staffType !== 'doctor_staff' && staffTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Facility Diagnostic Tests ({scopedTests.length} Tests)
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Sample Type</th>
                  <th>Cash Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scopedTests.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td><span className="badge badge-slate">{t.category}</span></td>
                    <td>{t.sampleType}</td>
                    <td><strong style={{ color: 'var(--primary-800)' }}>৳{t.price}</strong></td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal (Doctor Assistant vs Test Manager) */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={editingStaffId ? 'Edit Staff Member' : 'Assign New Staff Member'}>
        <form onSubmit={handleSaveStaff}>
          <div className="form-group">
            <label className="form-label">Staff Full Name *</label>
            <input type="text" required placeholder="e.g. Nusrat Jahan" className="form-input" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Staff Role Type *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="staffRoleType"
                  checked={staffRoleType === 'doctor_assistant'}
                  onChange={() => {
                    setStaffRoleType('doctor_assistant');
                    setStaffDesignation('Receptionist');
                  }}
                />
                Individual Doctor Assistant
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="staffRoleType"
                  checked={staffRoleType === 'test_manager'}
                  onChange={() => {
                    setStaffRoleType('test_manager');
                    setStaffDesignation('Lab Technician');
                  }}
                />
                Diagnostic Tests Manager
              </label>
            </div>
          </div>

          {staffRoleType === 'doctor_assistant' ? (
            <div className="form-group">
              <label className="form-label">Assign to Specific Doctor *</label>
              <select
                className="form-select"
                value={staffDoctorAssignment}
                onChange={(e) => setStaffDoctorAssignment(e.target.value)}
              >
                {scopedDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select
                className="form-select"
                value={staffDesignation}
                onChange={(e) => setStaffDesignation(e.target.value as any)}
              >
                <option value="Lab Technician">Lab Technician (Pathology)</option>
                <option value="Sample Collector">Phlebotomist / Sample Collector</option>
                <option value="Manager">Laboratory Operations Manager</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingStaffId ? 'Save Changes' : 'Assign Staff'}</Button>
          </div>
        </form>
      </Modal>

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedDoctorId={staffType === 'doctor_staff' ? assignedDoctorId : undefined}
        fixedLocationId={staffType === 'hospital_staff' ? 'LOC-001' : staffType === 'diagnostic_staff' ? 'LOC-002' : undefined}
        onSuccess={() => refetchAppointments()}
      />
    </div>
  );
};
