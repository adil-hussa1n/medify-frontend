import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctors, useStaff, useDiagnosticTests, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Building2, Plus, User, FileText } from 'lucide-react';
import type { AppointmentStatus } from '../types';
import { Link } from 'react-router-dom';

export const HospitalDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const hospitalId = currentUser.hospitalId || 'HOSP-001';

  const { data: appointments = [], refetch } = useAppointments({ institutionId: hospitalId });
  const { data: allDoctors = [] } = useDoctors();
  const { data: staffList = [] } = useStaff({ institutionId: hospitalId });
  const { data: allTests = [] } = useDiagnosticTests();

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

  const [activeTab, setActiveTab] = useState<'queue' | 'doctors' | 'tests'>('queue');
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const hospitalDoctors = allDoctors.filter((d) =>
    d.practiceLocations.some((loc) => loc.institutionId === hospitalId || loc.institutionName.toLowerCase().includes('ibn sina'))
  );

  const hospitalTests = allTests.filter((t) =>
    t.diagnosticCenterId === hospitalId || t.centerName?.toLowerCase().includes('ibn sina')
  );

  const filteredAppointments = appointments.filter((a) => {
    if (selectedStatusFilter === 'all') return true;
    return a.status === selectedStatusFilter;
  });

  const handleNextStatus = async (id: string, currentStatus: AppointmentStatus) => {
    let next: AppointmentStatus = 'completed';
    if (currentStatus === 'booked') next = 'checked_in';
    else if (currentStatus === 'checked_in') next = 'waiting';
    else if (currentStatus === 'waiting') next = 'in_consultation';
    else if (currentStatus === 'in_consultation') next = 'completed';

    await updateStatusMutation.mutateAsync({ id, status: next });
  };

  const handleRecordPayment = async (id: string) => {
    await recordPaymentMutation.mutateAsync(id);
  };

  return (
    <div className="container page-wrapper">
      {/* Hospital Tenant Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={22} color="var(--primary-800)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Ibn Sina Specialized Hospital</h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            Hospital Portal • Outpatient Chambers & Diagnostic Division
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
          Hospital Manual Booking
        </Button>
      </div>

      {/* Hospital Key Metrics */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Consultant Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{hospitalDoctors.length || 3}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>In-House Lab Tests</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{hospitalTests.length || 4}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Today's Bookings</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{appointments.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Chambers</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>24</strong>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          Queue & Appointments ({appointments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          Hospital Doctors ({hospitalDoctors.length || 3})
        </button>
        <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          Hospital Pathology & Tests ({hospitalTests.length || 4})
        </button>
      </div>

      {/* Tab 1: Queue Control */}
      {activeTab === 'queue' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Queue Control</h2>
              <p className="text-xs text-muted">Ibn Sina Hospital isolated records only</p>
            </div>

            <div>
              <select
                className="form-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              >
                <option value="all">All Statuses ({appointments.length})</option>
                <option value="booked">Booked</option>
                <option value="checked_in">Checked In</option>
                <option value="waiting">Waiting</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Patient</th>
                  <th>Doctor & Chamber</th>
                  <th>Payment (Cash)</th>
                  <th>Status</th>
                  <th>Queue Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-800)' }}>
                        #{apt.serialNumber}
                      </span>
                    </td>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecordPayment(apt.id)}
                        >
                          Collect ৳{apt.consultationFee}
                        </Button>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td>
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleNextStatus(apt.id, apt.status)}
                        >
                          Advance →
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

      {/* Tab 2: Hospital Doctors Directory */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Hospital Specialist Doctors</h2>
            <p className="text-xs text-muted">Consultant physicians conducting daily OPD chambers</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(hospitalDoctors.length > 0 ? hospitalDoctors : allDoctors.slice(0, 3)).map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                  <p className="text-xs text-muted">Chamber 204 • Fee: ৳800 (Cash)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Hospital Diagnostic Tests */}
      {activeTab === 'tests' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Hospital Diagnostic & Pathology Unit</h2>
            <p className="text-xs text-muted">In-house laboratory investigations and pathology tests</p>
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
                </tr>
              </thead>
              <tbody>
                {(hospitalTests.length > 0 ? hospitalTests : allTests.slice(0, 4)).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className="text-xs text-muted">{t.preparationInstructions}</div>
                    </td>
                    <td><span className="badge badge-slate">{t.category}</span></td>
                    <td>{t.sampleType}</td>
                    <td><strong style={{ color: 'var(--primary-800)' }}>৳{t.price}</strong></td>
                    <td><span className="badge badge-success">Available</span></td>
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
        fixedLocationId="LOC-001"
        onSuccess={() => refetch()}
      />
    </div>
  );
};
