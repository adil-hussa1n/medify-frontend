import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppointment, useQueue, useUpdateAppointmentStatus } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ChevronLeft, UserCheck } from 'lucide-react';

export const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: appointment, isLoading } = useAppointment(id);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const navigate = useNavigate();

  const { data: queue } = useQueue(
    appointment?.practiceLocationId,
    appointment?.appointmentDate
  );

  if (isLoading) {
    return (
      <div className="container page-wrapper">
        <div className="card skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container page-wrapper text-center">
        <h2>Appointment Not Found</h2>
      </div>
    );
  }

  const currentServing = queue?.currentSerialServing || 1;
  const serial = appointment.serialNumber;
  const patientsAhead = Math.max(0, serial - currentServing);
  const estimatedWaitMin = patientsAhead * 12;

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await updateStatusMutation.mutateAsync({ id: appointment.id, status: 'cancelled' });
    }
  };

  const handleCheckIn = async () => {
    await updateStatusMutation.mutateAsync({ id: appointment.id, status: 'checked_in' });
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '840px' }}>
      <button
        onClick={() => navigate('/patient/appointments')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-600)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}
      >
        <ChevronLeft size={16} /> Back to Appointments
      </button>

      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Appointment Details</h1>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
              ID: {appointment.id}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }} className="mobile-flex-col">
            {appointment.status === 'booked' && (
              <Button size="sm" variant="accent" onClick={handleCheckIn} leftIcon={<UserCheck size={15} />} style={{ width: '100%' }}>
                Self Check-In (I Have Arrived)
              </Button>
            )}
            {['booked', 'confirmed'].includes(appointment.status) && (
              <Button size="sm" variant="outline" onClick={handleCancel} style={{ width: '100%' }}>
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>

        {/* Live Serial & Queue Tracker Banner - Responsive Stack on Mobile */}
        <div
          style={{
            margin: '1.25rem 0',
            padding: '1.25rem 1rem',
            backgroundColor: 'var(--primary-900)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Serial
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-500)', lineHeight: 1.1, marginTop: '0.2rem' }}>
              #{appointment.serialNumber}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Now Serving
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--white)', lineHeight: 1.1, marginTop: '0.2rem' }}>
              #{currentServing}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated Wait
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--white)', marginTop: '0.35rem' }}>
              ~{estimatedWaitMin} mins
            </div>
            <span className="text-xs" style={{ color: 'var(--slate-400)' }}>
              ({patientsAhead} patients ahead)
            </span>
          </div>
        </div>

        {/* Doctor & Location Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Doctor
            </h3>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
              {appointment.doctorName}
            </p>
            <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.85rem' }}>
              {appointment.doctorSpecialization}
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Location & Chamber
            </h3>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
              {appointment.institutionName}
            </p>
            <p className="text-xs text-muted">
              {appointment.chamberName} • {appointment.address}
            </p>
          </div>
        </div>

        {/* Payment & Prescriptions */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="text-xs text-muted" style={{ display: 'block' }}>Payment Terms</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
              ৳{appointment.consultationFee} (Cash Only)
            </span>
          </div>

          {appointment.hasPrescription && appointment.prescriptionId && (
            <Link to={`/patient/prescriptions/${appointment.prescriptionId}`} style={{ width: '100%' }} className="mobile-full-width">
              <Button variant="accent" size="sm" style={{ width: '100%' }}>
                View Digital Prescription
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
