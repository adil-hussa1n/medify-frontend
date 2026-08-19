import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useAppointments,
  useDoctor,
  useDoctors,
  useDiagnosticOrders,
  useDiagnosticTests,
  useUpdateAppointmentStatus,
  useUpdateDiagnosticOrderStatus,
  useRecordPayment,
} from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, Phone, Stethoscope, Building2, User, FileText, CheckCircle2 } from 'lucide-react';
import type { AppointmentStatus, DiagnosticOrderStatus } from '../types';

export const StaffDashboardPage: React.FC<{ staffType: 'doctor_staff' | 'hospital_staff' | 'diagnostic_staff' }> = ({
  staffType,
}) => {
  const { currentUser } = useAuth();
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<'queue' | 'doctors' | 'tests'>('queue');

  // 1. Doctor Staff: Strictly assigned to 1 Doctor
  const assignedDoctorId = currentUser.assignedDoctorId || 'DOC-001';
  const { data: assignedDoctor } = useDoctor(assignedDoctorId);

  // 2. Hospital Staff: Strictly assigned to 1 Hospital (HOSP-001: Ibn Sina)
  const hospitalId = currentUser.hospitalId || 'HOSP-001';

  // 3. Diagnostic Staff: Strictly assigned to 1 Diagnostic Center (DIAG-001: Lab Aid)
  const diagnosticCenterId = currentUser.diagnosticCenterId || 'DIAG-001';

  // Appointments / Queue Query scoped strictly to assigned entity
  const { data: allAppointments = [], refetch: refetchAppointments } = useAppointments({
    doctorId: staffType === 'doctor_staff' ? assignedDoctorId : undefined,
    institutionId: staffType === 'hospital_staff' ? hospitalId : undefined,
  });

  // Diagnostic Orders Query scoped strictly to assigned Diagnostic Center
  const { data: diagnosticOrders = [], refetch: refetchDiagnostic } = useDiagnosticOrders({
    centerId: staffType === 'diagnostic_staff' ? diagnosticCenterId : undefined,
  });

  // Tests & Doctors Query for Hospital & Diagnostic scopes
  const { data: allDoctors = [] } = useDoctors();
  const { data: allTests = [] } = useDiagnosticTests();

  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateDiagnosticStatusMutation = useUpdateDiagnosticOrderStatus();
  const recordPaymentMutation = useRecordPayment();

  // Scoped Doctors
  const scopedDoctors =
    staffType === 'doctor_staff'
      ? assignedDoctor ? [assignedDoctor] : []
      : staffType === 'hospital_staff'
      ? allDoctors.filter((d) => d.practiceLocations.some((loc) => loc.institutionId === hospitalId || loc.institutionName.toLowerCase().includes('ibn sina')))
      : allDoctors.filter((d) => d.practiceLocations.some((loc) => loc.institutionId === diagnosticCenterId || loc.institutionName.toLowerCase().includes('lab aid')));

  // Scoped Tests
  const scopedTests =
    staffType === 'hospital_staff'
      ? allTests.filter((t) => t.diagnosticCenterId === hospitalId || t.centerName?.toLowerCase().includes('ibn sina'))
      : allTests.filter((t) => t.diagnosticCenterId === diagnosticCenterId || t.centerName?.toLowerCase().includes('lab aid'));

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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = allAppointments.filter((a) => a.appointmentDate === todayStr);

  return (
    <div className="container page-wrapper">
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
                ? 'Ibn Sina Hospital — Staff Desk'
                : 'Lab Aid Diagnostic — Reception & Testing Desk'}
            </h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            {currentUser.name} • {staffType === 'doctor_staff' ? 'Single Doctor Scope (DOC-001)' : staffType === 'hospital_staff' ? 'Tenant Scope: Ibn Sina Hospital' : 'Tenant Scope: Lab Aid Diagnostic Center'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          style={{ width: '100%' }}
          className="mobile-full-width"
          leftIcon={<Plus size={15} />}
          onClick={() => setIsManualBookingOpen(true)}
        >
          Manual Serial Booking
        </Button>
      </div>

      {/* Tabs Navigation for Hospital & Diagnostic Staff */}
      {staffType !== 'doctor_staff' && (
        <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
          <button className={`tab-btn ${staffTab === 'queue' ? 'active' : ''}`} onClick={() => setStaffTab('queue')}>
            {staffType === 'diagnostic_staff' ? `Sample Orders (${diagnosticOrders.length})` : `Patient Queue (${todayApts.length})`}
          </button>
          <button className={`tab-btn ${staffTab === 'doctors' ? 'active' : ''}`} onClick={() => setStaffTab('doctors')}>
            Facility Doctors ({scopedDoctors.length})
          </button>
          <button className={`tab-btn ${staffTab === 'tests' ? 'active' : ''}`} onClick={() => setStaffTab('tests')}>
            Facility Tests ({scopedTests.length})
          </button>
        </div>
      )}

      {/* 1. DOCTOR STAFF VIEW: Single Doctor Queue */}
      {staffType === 'doctor_staff' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Today's Queue for {assignedDoctor?.name} ({todayApts.length} Patients)
          </h2>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Patient Details</th>
                  <th>Practice Chamber</th>
                  <th>Payment (Cash)</th>
                  <th>Status</th>
                  <th>Reception Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayApts.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-800)' }}>
                        #{apt.serialNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      <div className="text-xs text-muted">
                        <Phone size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {apt.patientPhone}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{apt.institutionName}</div>
                      <div className="text-xs text-muted">{apt.chamberName}</div>
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
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {apt.status === 'booked' && (
                          <Button size="sm" variant="accent" onClick={() => handleNextStatus(apt.id, apt.status)}>
                            Check In
                          </Button>
                        )}
                        {apt.status === 'checked_in' && (
                          <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                            Call In →
                          </Button>
                        )}
                        {apt.status === 'waiting' && (
                          <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                            Call In →
                          </Button>
                        )}
                        {apt.status === 'in_consultation' && (
                          <Button size="sm" variant="secondary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                            Finish ✓
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. HOSPITAL STAFF VIEW */}
      {staffType === 'hospital_staff' && staffTab === 'queue' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ibn Sina Hospital OPD Queue ({todayApts.length} Patients)
          </h2>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Patient Details</th>
                  <th>Doctor & Chamber</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Front Desk Action</th>
                </tr>
              </thead>
              <tbody>
                {todayApts.map((apt) => (
                  <tr key={apt.id}>
                    <td><strong style={{ fontSize: '1.1rem', color: 'var(--primary-800)' }}>#{apt.serialNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      <div className="text-xs text-muted">{apt.patientPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.doctorName}</div>
                      <div className="text-xs text-muted">{apt.chamberName}</div>
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
                      <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                        Advance →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DIAGNOSTIC STAFF VIEW: Lab Aid Orders */}
      {staffType === 'diagnostic_staff' && staffTab === 'queue' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Lab Aid Diagnostic Sample Pipeline ({diagnosticOrders.length} Orders)
          </h2>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Investigation</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Lab Tech Action</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticOrders.map((ord) => (
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
                    <td><StatusBadge status={ord.status} /></td>
                    <td>
                      {ord.status !== 'report_ready' && (
                        <Button size="sm" variant="primary" onClick={() => handleNextDiagnosticStatus(ord.id, ord.status)}>
                          Advance Pipeline →
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

      {/* Scoped Doctors Tab */}
      {staffType !== 'doctor_staff' && staffTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Facility Doctors Roster ({scopedDoctors.length} Specialists)
          </h2>
          <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
            {scopedDoctors.map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img src={doc.photoUrl} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                  <p className="text-xs text-muted">Consultation Fee: ৳800</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoped Tests Tab */}
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
