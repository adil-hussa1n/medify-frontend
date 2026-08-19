import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { Calendar, Clock, ChevronRight, Plus, Filter, RotateCcw } from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: appointments = [], isLoading } = useAppointments({
    patientId: currentUser.patientId || 'PAT-001',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering States
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAppointments = appointments.filter((apt) => {
    // 1. Date Filter
    if (dateFilter && apt.appointmentDate !== dateFilter) {
      return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false;
    }

    // 3. Time Filter (Upcoming vs Past vs Today)
    if (timeFilter === 'today') {
      return apt.appointmentDate === todayStr;
    }
    if (timeFilter === 'upcoming') {
      return (
        apt.appointmentDate >= todayStr &&
        ['booked', 'confirmed', 'checked_in', 'waiting', 'in_consultation'].includes(apt.status)
      );
    }
    if (timeFilter === 'past') {
      return (
        apt.appointmentDate < todayStr ||
        ['completed', 'cancelled', 'no_show'].includes(apt.status)
      );
    }

    return true;
  });

  const handleResetFilters = () => {
    setTimeFilter('all');
    setDateFilter('');
    setStatusFilter('all');
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '920px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Appointments</h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
            Filter previous vs upcoming visits, track live serials, and access prescriptions.
          </p>
        </div>
        <Link to="/doctors">
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            New Appointment
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Quick Time Range Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button
              className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              All Visits ({appointments.length})
            </button>
            <button
              className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTimeFilter('upcoming')}
            >
              Upcoming ({appointments.filter((a) => a.appointmentDate >= todayStr && a.status !== 'completed').length})
            </button>
            <button
              className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`}
              onClick={() => setTimeFilter('today')}
            >
              Today ({appointments.filter((a) => a.appointmentDate === todayStr).length})
            </button>
            <button
              className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`}
              onClick={() => setTimeFilter('past')}
            >
              Past / Completed ({appointments.filter((a) => a.appointmentDate < todayStr || a.status === 'completed').length})
            </button>
          </div>

          {(dateFilter || statusFilter !== 'all' || timeFilter !== 'all') && (
            <Button size="sm" variant="outline" leftIcon={<RotateCcw size={13} />} onClick={handleResetFilters}>
              Reset
            </Button>
          )}
        </div>

        {/* Date Picker & Status Dropdown Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)' }}>
          <div>
            <label className="form-label text-xs">Filter by Exact Date</label>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-xs">Filter by Status</label>
            <select
              className="form-select"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="checked_in">Checked In</option>
              <option value="waiting">Waiting</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '130px' }} />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Appointments Found</h3>
          <p className="text-xs text-muted" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>
            {dateFilter || statusFilter !== 'all' || timeFilter !== 'all'
              ? 'No appointments matched your current filter criteria.'
              : 'Book your first doctor appointment and receive an immediate confirmed serial.'}
          </p>
          {dateFilter || statusFilter !== 'all' || timeFilter !== 'all' ? (
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          ) : (
            <Link to="/doctors">
              <Button size="sm" variant="primary">Find a Doctor</Button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="card card-hover"
              style={{
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '240px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-100)',
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--slate-500)' }}>SERIAL</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-800)', lineHeight: 1 }}>
                    #{apt.serialNumber}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {apt.doctorName}
                    </h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {apt.doctorSpecialization}
                  </p>
                  <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                    🏥 {apt.institutionName} • {apt.chamberName}
                  </p>

                  <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--slate-700)', flexWrap: 'wrap' }}>
                    <span>📅 {apt.appointmentDate}</span>
                    <span>⏰ Approx. {apt.estimatedTime}</span>
                    <span style={{ fontWeight: 600 }}>৳{apt.consultationFee} (Cash)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '240px' }} className="mobile-full-width">
                {apt.hasPrescription && apt.prescriptionId && (
                  <Link to={`/patient/prescriptions/${apt.prescriptionId}`} style={{ flex: 1 }}>
                    <Button size="sm" variant="accent" style={{ width: '100%' }}>
                      Rx
                    </Button>
                  </Link>
                )}
                <Link to={`/patient/appointments/${apt.id}`} style={{ flex: 1 }}>
                  <Button size="sm" variant="primary" style={{ width: '100%' }} rightIcon={<ChevronRight size={14} />}>
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
