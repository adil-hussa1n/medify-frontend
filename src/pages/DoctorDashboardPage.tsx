import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctor } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, FileText, Building2, Stethoscope, MapPin } from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const doctorId = currentUser.doctorId || 'DOC-001';
  const { data: doctor } = useDoctor(doctorId);
  const { data: allAppointments = [], refetch } = useAppointments({ doctorId });

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'hospital' | 'diagnostic_center' | 'individual_chamber'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = allAppointments.filter((a) => a.appointmentDate === todayStr);

  const locations = doctor?.practiceLocations || [];
  const locationStats = locations.map((loc) => {
    const locApts = todayAppointments.filter((a) => a.practiceLocationId === loc.id);
    return {
      ...loc,
      todayCount: locApts.length,
      waitingCount: locApts.filter((a) => ['booked', 'checked_in', 'waiting'].includes(a.status)).length,
      completedCount: locApts.filter((a) => a.status === 'completed').length,
    };
  });

  const filteredAppointments = allAppointments.filter((apt) => {
    if (activeTab === 'all') return true;
    return apt.locationType === activeTab;
  });

  return (
    <div className="container page-wrapper">
      {/* Doctor Overview Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Doctor Dashboard
          </h1>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.875rem' }}>
            {doctor?.name} ({doctor?.id}) • {doctor?.specialization}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }} className="mobile-flex-col">
          <Button
            variant="primary"
            size="sm"
            style={{ width: '100%' }}
            leftIcon={<Plus size={15} />}
            onClick={() => setIsManualBookingOpen(true)}
          >
            Manual Patient Booking
          </Button>
          <Link to="/doctor/prescriptions/new" style={{ width: '100%' }} className="mobile-full-width">
            <Button variant="accent" size="sm" style={{ width: '100%' }} leftIcon={<FileText size={15} />}>
              Create Rx
            </Button>
          </Link>
        </div>
      </div>

      {/* Multi-Location Global Breakdown */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Today's Practice Locations ({todayAppointments.length} Booked)
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {locationStats.map((loc) => {
            const isHosp = loc.locationType === 'hospital';
            const isDiag = loc.locationType === 'diagnostic_center';

            return (
              <div
                key={loc.id}
                className="card"
                style={{
                  borderTop: `4px solid ${isHosp ? 'var(--primary-800)' : isDiag ? 'var(--accent-600)' : '#E11D48'}`,
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {isHosp ? <Building2 size={16} color="var(--primary-800)" /> : isDiag ? <Stethoscope size={16} color="var(--accent-600)" /> : <MapPin size={16} color="#E11D48" />}
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{loc.institutionName}</h3>
                    </div>
                    <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                      {loc.chamberName}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                    ৳{loc.consultationFee}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                  <div>
                    <span className="text-xs text-muted" style={{ display: 'block' }}>Booked</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>{loc.todayCount}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ display: 'block' }}>Waiting</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--primary-700)' }}>{loc.waitingCount}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ display: 'block' }}>Completed</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--success-600)' }}>{loc.completedCount}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <Link to={`/doctor/appointments?locId=${loc.id}`}>
                    <Button size="sm" variant="outline" style={{ width: '100%' }}>
                      Manage Queue
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Filter Tabs & Global Patient Queue Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Appointments & Queue Overview</h2>
          <p className="text-xs text-muted">Appointments clearly tagged by practice location</p>
        </div>

        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({allAppointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            Hospital
          </button>
          <button
            className={`tab-btn ${activeTab === 'diagnostic_center' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostic_center')}
          >
            Diagnostic Center
          </button>
          <button
            className={`tab-btn ${activeTab === 'individual_chamber' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual_chamber')}
          >
            Chamber
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Patient</th>
                <th>Practice Location</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
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
                    <div style={{ fontWeight: 500 }}>{apt.institutionName}</div>
                    <div className="text-xs text-muted">{apt.chamberName}</div>
                  </td>
                  <td>
                    <div>{apt.appointmentDate}</div>
                    <div className="text-xs text-muted">{apt.estimatedTime}</div>
                  </td>
                  <td>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td>
                    <Link to={`/doctor/prescriptions/new?aptId=${apt.id}`}>
                      <Button size="sm" variant="primary">
                        Rx
                      </Button>
                    </Link>
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
        fixedDoctorId={doctorId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
