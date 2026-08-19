import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctor, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, Phone } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const StaffDashboardPage: React.FC<{ staffType: 'doctor_staff' | 'hospital_staff' | 'diagnostic_staff' }> = ({
  staffType,
}) => {
  const { currentUser } = useAuth();
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  const doctorId = currentUser.assignedDoctorId || 'DOC-001';
  const { data: doctor } = useDoctor(doctorId);
  const { data: appointments = [], refetch } = useAppointments({
    doctorId: staffType === 'doctor_staff' ? doctorId : undefined,
    institutionId: staffType === 'hospital_staff' ? 'HOSP-001' : undefined,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter((a) => a.appointmentDate === todayStr);

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {staffType === 'doctor_staff' ? 'Doctor Assistant Portal' : staffType === 'hospital_staff' ? 'Hospital Front Desk' : 'Diagnostic Desk'}
          </h1>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
            {currentUser.name} • {staffType === 'doctor_staff' ? `Assigned to ${doctor?.name || 'Doctor'}` : 'Frontline Operations'}
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
          Manual Patient Serial Booking
        </Button>
      </div>

      {/* Frontline Operations Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Today's Patient Queue ({todayApts.length} Patients)
        </h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Patient Details</th>
                <th>Payment (Cash)</th>
                <th>Status</th>
                <th>Reception / Nurse Actions</th>
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
                          Move Waiting
                        </Button>
                      )}
                      {apt.status === 'waiting' && (
                        <Button size="sm" variant="primary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                          Call In
                        </Button>
                      )}
                      {apt.status === 'in_consultation' && (
                        <Button size="sm" variant="secondary" onClick={() => handleNextStatus(apt.id, apt.status)}>
                          Complete
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

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedDoctorId={staffType === 'doctor_staff' ? doctorId : undefined}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
