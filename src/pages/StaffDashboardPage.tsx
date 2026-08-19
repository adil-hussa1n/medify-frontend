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
import { Plus, Phone, Stethoscope, Building2, User, FileText, CheckCircle2, RotateCcw, Calendar, Edit, Trash2, Search, Users, MapPin, Tag, FlaskConical, Clock } from 'lucide-react';
import type { AppointmentStatus, DiagnosticOrderStatus, Staff } from '../types';
import { mockStaff } from '../api/mock/data';

export const StaffDashboardPage: React.FC<{ staffType: 'doctor_staff' | 'hospital_staff' | 'diagnostic_staff' }> = ({
  staffType,
}) => {
  const { currentUser } = useAuth();
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Scoped Entity IDs & Task Meta
  const assignedDoctorId = currentUser.assignedDoctorId || 'DOC-001';
  const assignedLocationId = currentUser.assignedLocationId;
  const assignedChamberName = currentUser.assignedChamberName;
  const staffTaskType = currentUser.staffTaskType || 'chamber_desk';

  const { data: assignedDoctor } = useDoctor(assignedDoctorId);

  const hospitalId = currentUser.hospitalId || 'HOSP-001';
  const diagnosticCenterId = currentUser.diagnosticCenterId || 'DIAG-001';

  // Live Appointments Query scoped strictly to assigned entity / chamber
  const { data: allAppointments = [], refetch: refetchAppointments } = useAppointments({
    doctorId: staffType === 'doctor_staff' || (currentUser.assignedDoctorId && staffTaskType === 'chamber_desk') ? assignedDoctorId : undefined,
    institutionId: staffType === 'hospital_staff' ? hospitalId : undefined,
  });

  // Diagnostic Orders Query scoped strictly to assigned Diagnostic Center
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
  const [chamberFilter, setChamberFilter] = useState<string>(assignedLocationId || 'all');
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

  // Filtered Appointments (Chamber-isolated if assignedLocationId is present, else Doctor/Status-wise)
  const filteredAppointments = allAppointments.filter((apt) => {
    // 1. Chamber Isolation (If staff member is assigned to a specific chamber room)
    if (assignedLocationId && apt.practiceLocationId && apt.practiceLocationId !== assignedLocationId) {
      return false;
    }
    if (chamberFilter !== 'all' && apt.practiceLocationId !== chamberFilter) {
      return false;
    }

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
    setChamberFilter(assignedLocationId || 'all');
    setSearchQuery('');
  };

  // Determine specific task heading & classification
  const getTaskClassification = () => {
    // 1. DOCTOR ASSISTANT (Individual Doctor & Chamber)
    if (staffType === 'doctor_staff') {
      return {
        mode: 'doctor_chamber',
        title: `${currentUser.name}`,
        subtitle: `Doctor Chamber Assistant • Assigned Doctor: ${assignedDoctor?.name || 'Prof. Dr. M. A. Rahman'}`,
        chamberTag: assignedChamberName || 'Doctor Practice Room',
        icon: <User size={22} color="var(--primary-800)" />,
        badgeText: 'Doctor Assistant Desk',
        badgeColor: 'badge-primary',
      };
    }

    // 2. HOSPITAL STAFF
    if (staffType === 'hospital_staff') {
      if (staffTaskType === 'lab_desk') {
        return {
          mode: 'hospital_lab',
          title: `${currentUser.name}`,
          subtitle: `Ibn Sina Hospital • Pathology & Diagnostic Tests Operations Desk`,
          chamberTag: 'Hospital Pathology & Imaging Wing',
          icon: <FlaskConical size={22} color="var(--accent-600)" />,
          badgeText: 'Hospital Lab & Tests Desk',
          badgeColor: 'badge-accent',
        };
      }
      return {
        mode: 'hospital_chamber',
        title: `${currentUser.name}`,
        subtitle: `Ibn Sina Hospital • OPD Doctor Chambers Reception Desk (${assignedDoctor?.name || 'Assigned Doctor'})`,
        chamberTag: assignedChamberName || 'Chamber 204 (Cardiology OPD)',
        icon: <Building2 size={22} color="var(--primary-800)" />,
        badgeText: 'Hospital Doctor Chambers Desk',
        badgeColor: 'badge-primary',
      };
    }

    // 3. DIAGNOSTIC STAFF
    if (staffType === 'diagnostic_staff') {
      if (staffTaskType === 'lab_desk') {
        return {
          mode: 'diagnostic_lab',
          title: `${currentUser.name}`,
          subtitle: `Lab Aid Diagnostic • Clinical Pathology & Sample Investigation Pipeline`,
          chamberTag: 'Pathology & Diagnostic Testing Lab',
          icon: <Stethoscope size={22} color="var(--accent-600)" />,
          badgeText: 'Diagnostic Pathology Lab Tech',
          badgeColor: 'badge-accent',
        };
      }
      return {
        mode: 'diagnostic_chamber',
        title: `${currentUser.name}`,
        subtitle: `Lab Aid Diagnostic • Visiting Specialist Doctor Chamber Desk (${assignedDoctor?.name || 'Prof. Dr. M. A. Rahman'})`,
        chamberTag: assignedChamberName || 'Chamber 4 (Consultation Floor)',
        icon: <Building2 size={22} color="var(--primary-800)" />,
        badgeText: 'Visiting Doctor Chamber Desk',
        badgeColor: 'badge-primary',
      };
    }

    return {
      mode: 'doctor_chamber',
      title: `${currentUser.name}`,
      subtitle: `Assigned Operational Desk`,
      chamberTag: 'General Reception',
      icon: <User size={22} color="var(--primary-800)" />,
      badgeText: 'Staff Desk',
      badgeColor: 'badge-slate',
    };
  };

  const taskInfo = getTaskClassification();
  const isLabDesk = taskInfo.mode === 'hospital_lab' || taskInfo.mode === 'diagnostic_lab';

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
      {/* Scoped Entity & Task Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {taskInfo.icon}
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {taskInfo.title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span className={`badge ${taskInfo.badgeColor}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {taskInfo.badgeText}
            </span>
            <span className="badge badge-slate" style={{ fontSize: '0.725rem' }}>
              <MapPin size={11} style={{ marginRight: '3px' }} />
              {taskInfo.chamberTag}
            </span>
            <p className="text-muted text-xs">
              {taskInfo.subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!isLabDesk ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => setIsManualBookingOpen(true)}
            >
              Manual Serial Booking
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => alert('New test order registration initiated for patient.')}
            >
              Register Lab Order
            </Button>
          )}
        </div>
      </div>

      {/* Task Summary Stat Metrics */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        {!isLabDesk ? (
          <>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Chamber Queue</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{filteredAppointments.length}</strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Today's Serials</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>
                {filteredAppointments.filter((a) => a.appointmentDate === todayStr).length}
              </strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Waiting Room</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>
                {filteredAppointments.filter((a) => ['booked', 'checked_in', 'waiting'].includes(a.status)).length}
              </strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Completed</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>
                {filteredAppointments.filter((a) => a.status === 'completed').length}
              </strong>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Total Test Orders</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{diagnosticOrders.length}</strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Today's Samples</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>
                {diagnosticOrders.filter((o) => o.scheduledDate === todayStr).length}
              </strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>In Processing</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>
                {diagnosticOrders.filter((o) => ['booked', 'accepted', 'sample_collected', 'processing'].includes(o.status)).length}
              </strong>
            </div>
            <div className="card" style={{ padding: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Reports Ready</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>
                {diagnosticOrders.filter((o) => o.status === 'report_ready').length}
              </strong>
            </div>
          </>
        )}
      </div>

      {/* PAGE 1: DOCTOR CHAMBER QUEUE VIEW (For Doctor Assistant, Hospital Chamber Desk, Diagnostic Chamber Desk) */}
      {!isLabDesk && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {taskInfo.chamberTag} — Patient Queue Control
              </h2>
              <p className="text-xs text-muted">
                Doctor: {assignedDoctor?.name || 'Prof. Dr. M. A. Rahman'} • Check in patients, manage waiting status, and record fees
              </p>
            </div>
          </div>

          {/* Filtering Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today ({allAppointments.filter((a) => a.appointmentDate === todayStr && (!assignedLocationId || a.practiceLocationId === assignedLocationId)).length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Upcoming
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Past OPD
              </button>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Dates ({filteredAppointments.length})
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
              {(dateFilter || statusFilter !== 'all' || timeFilter !== 'today' || searchQuery) && (
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
                  <th>Chamber Room</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Payment (Cash)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                      No patients in this chamber queue for the selected filters.
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
                        <strong style={{ color: 'var(--primary-800)' }}>{apt.chamberName}</strong>
                        <div className="text-xs text-muted">{apt.institutionName}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.doctorName}</div>
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

      {/* PAGE 2: LABORATORY & DIAGNOSTIC TESTS VIEW (For Hospital Lab Tech & Diagnostic Lab Tech) */}
      {isLabDesk && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {taskInfo.chamberTag} — Sample Processing Pipeline
              </h2>
              <p className="text-xs text-muted">
                Manage phlebotomy collection, sample processing pipeline, and finalize reports
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Orders ({diagnosticOrders.length})
              </button>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today's Samples ({diagnosticOrders.filter((o) => o.scheduledDate === todayStr).length})
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

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedDoctorId={staffType === 'doctor_staff' || (currentUser.assignedDoctorId && staffTaskType === 'chamber_desk') ? assignedDoctorId : undefined}
        fixedLocationId={assignedLocationId || (staffType === 'hospital_staff' ? 'LOC-001' : staffType === 'diagnostic_staff' ? 'LOC-002' : undefined)}
        onSuccess={() => refetchAppointments()}
      />
    </div>
  );
};
