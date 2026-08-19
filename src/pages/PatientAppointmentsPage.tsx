import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { Calendar, Clock, ChevronRight, AlertCircle, Plus } from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: appointments = [], isLoading } = useAppointments({
    patientId: currentUser.patientId || 'PAT-001',
  });

  return (
    <div className="container page-wrapper" style={{ maxWidth: '880px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Appointments</h1>
          <p className="text-muted" style={{ marginTop: '0.2rem' }}>
            Track your appointment serials, live queue position, and visit history.
          </p>
        </div>
        <Link to="/doctors">
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            New Appointment
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '140px' }} />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No Appointments Yet</h3>
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            Book your first doctor appointment and receive an immediate serial number.
          </p>
          <Link to="/doctors">
            <Button variant="primary">Find a Doctor</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="card card-hover"
              style={{
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-100)',
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--slate-500)' }}>SERIAL</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-800)', lineHeight: 1 }}>
                    #{apt.serialNumber}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {apt.doctorName}
                    </h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {apt.doctorSpecialization}
                  </p>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                    🏥 {apt.institutionName} • {apt.chamberName}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                    <span>📅 {apt.appointmentDate}</span>
                    <span>⏰ Approx. {apt.estimatedTime}</span>
                    <span>৳{apt.consultationFee} (Cash)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {apt.hasPrescription && apt.prescriptionId && (
                  <Link to={`/patient/prescriptions/${apt.prescriptionId}`}>
                    <Button size="sm" variant="accent">
                      Prescription
                    </Button>
                  </Link>
                )}
                <Link to={`/patient/appointments/${apt.id}`}>
                  <Button size="sm" variant="outline" rightIcon={<ChevronRight size={14} />}>
                    Track Queue
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
