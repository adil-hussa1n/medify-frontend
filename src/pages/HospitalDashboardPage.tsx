import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctors, useStaff, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Building2, Plus } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const HospitalDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const hospitalId = currentUser.hospitalId || 'HOSP-001';

  const { data: appointments = [], refetch } = useAppointments({ institutionId: hospitalId });
  const { data: allDoctors = [] } = useDoctors();
  const { data: staffList = [] } = useStaff({ institutionId: hospitalId });
  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const hospitalDoctors = allDoctors.filter((d) =>
    d.practiceLocations.some((loc) => loc.institutionId === hospitalId)
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
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
            Tenant-Isolated Portal • Dhanmondi, Dhaka
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
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{hospitalDoctors.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Staff</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{staffList.length + 4}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Booked</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{appointments.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Chambers</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--success-600)' }}>24</strong>
        </div>
      </div>

      {/* Hospital Queue & Appointments Management */}
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

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedLocationId="LOC-001"
        onSuccess={() => refetch()}
      />
    </div>
  );
};
