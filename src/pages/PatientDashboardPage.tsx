import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments, usePrescriptions, useDiagnosticOrders } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { Search, Calendar, FileText, Activity, Clock, ChevronRight, Stethoscope } from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: appointments = [] } = useAppointments({ patientId: currentUser.patientId || 'PAT-001' });
  const { data: prescriptions = [] } = usePrescriptions({ patientId: currentUser.patientId || 'PAT-001' });
  const { data: orders = [] } = useDiagnosticOrders({ patientId: currentUser.patientId || 'PAT-001' });

  const upcomingApt = appointments.find((a) => ['booked', 'confirmed', 'checked_in', 'waiting', 'in_consultation'].includes(a.status));

  return (
    <div className="container page-wrapper" style={{ maxWidth: '840px', boxSizing: 'border-box' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.25 }}>
          Good day, {currentUser.name}
        </h1>
        <p className="text-muted" style={{ marginTop: '0.2rem', fontSize: '0.85rem' }}>
          What would you like to do today?
        </p>
      </div>

      {/* Quick Action Discovery Cards */}
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/doctors"
          className="card card-hover"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'var(--primary-800)',
            color: 'var(--white)',
            border: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Search size={18} color="var(--white)" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.2 }}>Find a Doctor</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary-100)', marginTop: '0.1rem' }}>
              Search & book serials
            </p>
          </div>
        </Link>

        <Link
          to="/tests"
          className="card card-hover"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-50)',
              color: 'var(--accent-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.2 }}>Book Test</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
              Walk-in / Home
            </p>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointment Widget */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Appointment</h2>
          <Link to="/patient/appointments" style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
            View All ({appointments.length})
          </Link>
        </div>

        {upcomingApt ? (
          <div
            className="card"
            style={{
              padding: '1.15rem',
              borderLeft: '4px solid var(--primary-800)',
              backgroundColor: 'var(--white)',
            }}
          >
            {/* Top row: Doctor Info + Serial Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {upcomingApt.doctorName}
                  </h3>
                  <StatusBadge status={upcomingApt.status} />
                </div>
                <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.8125rem', marginTop: '0.1rem' }}>
                  {upcomingApt.doctorSpecialization}
                </p>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem', lineHeight: 1.35 }}>
                  🏥 {upcomingApt.institutionName} • {upcomingApt.chamberName}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-100)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.6rem', color: 'var(--slate-500)', display: 'block', fontWeight: 700, letterSpacing: '0.05em' }}>
                  SERIAL
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-800)', lineHeight: 1.1 }}>
                  #{upcomingApt.serialNumber}
                </span>
              </div>
            </div>

            {/* Middle row: Schedule info */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--slate-700)',
                flexWrap: 'wrap',
                marginTop: '0.75rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--slate-100)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Calendar size={13} color="var(--primary-700)" /> {upcomingApt.appointmentDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Clock size={13} color="var(--primary-700)" /> Approx. {upcomingApt.estimatedTime}
              </span>
              <span style={{ fontWeight: 600 }}>
                ৳{upcomingApt.consultationFee} (Cash)
              </span>
            </div>

            {/* Bottom row: Full-width button */}
            <div style={{ marginTop: '0.75rem' }}>
              <Link to={`/patient/appointments/${upcomingApt.id}`} style={{ display: 'block', width: '100%' }}>
                <Button size="sm" variant="primary" style={{ width: '100%', minHeight: '38px' }} rightIcon={<ChevronRight size={14} />}>
                  View Live Queue & Details
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p className="text-muted text-xs" style={{ marginBottom: '0.65rem' }}>No upcoming appointments scheduled.</p>
            <Link to="/doctors">
              <Button size="sm" variant="primary">
                Book an Appointment
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Health Records */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.65rem' }}>
          Recent Health Records
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Recent Prescription Card */}
          <div className="card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={16} color="var(--primary-700)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Prescriptions</h3>
              </div>
              <Link to="/patient/prescriptions" style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {prescriptions.length > 0 ? (
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prescriptions[0].snapshot.doctorName}
                </p>
                <p className="text-xs text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prescriptions[0].snapshot.institutionName} • {prescriptions[0].date}
                </p>
                <Link to={`/patient/prescriptions/${prescriptions[0].id}`} style={{ marginTop: '0.65rem', display: 'block' }}>
                  <Button size="sm" variant="outline" style={{ width: '100%', minHeight: '34px', fontSize: '0.75rem' }}>
                    View Rx
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted">No prescriptions yet.</p>
            )}
          </div>

          {/* Recent Diagnostic Order Card */}
          <div className="card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Activity size={16} color="var(--accent-600)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Diagnostic</h3>
              </div>
              <Link to="/patient/reports" style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {orders.length > 0 ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {orders[0].testName}
                  </p>
                  <StatusBadge status={orders[0].status} />
                </div>
                <p className="text-xs text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {orders[0].centerName}
                </p>
                <Link to={`/patient/reports/${orders[0].id}`} style={{ marginTop: '0.65rem', display: 'block' }}>
                  <Button size="sm" variant="outline" style={{ width: '100%', minHeight: '34px', fontSize: '0.75rem' }}>
                    View Order
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted">No diagnostic orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
