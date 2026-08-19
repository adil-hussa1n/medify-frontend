import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctor, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, FileText, Building2, Stethoscope, MapPin, ChevronRight, RotateCcw, Calendar } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const doctorId = currentUser.doctorId || 'DOC-001';
  const { data: doctor } = useDoctor(doctorId);
  const { data: allAppointments = [], refetch } = useAppointments({ doctorId });

  const [searchParams, setSearchParams] = useSearchParams();
  const locIdParam = searchParams.get('locId');

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>(locIdParam || 'all');
  const [activeTab, setActiveTab] = useState<'all' | 'hospital' | 'diagnostic_center' | 'individual_chamber'>('all');

  // Time & Date Filtering
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState<string>('');

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

  // Filter appointments
  const effectiveLocFilter = locIdParam || activeLocationFilter;
  const filteredAppointments = allAppointments.filter((apt) => {
    // 1. Location Filter
    if (effectiveLocFilter !== 'all' && apt.practiceLocationId !== effectiveLocFilter) {
      return false;
    }

    // 2. Tab Filter
    if (activeTab !== 'all' && apt.locationType !== activeTab) {
      return false;
    }

    // 3. Exact Date Filter
    if (dateFilter && apt.appointmentDate !== dateFilter) {
      return false;
    }

    // 4. Time Range Filter
    if (timeFilter === 'today' && apt.appointmentDate !== todayStr) {
      return false;
    }
    if (timeFilter === 'upcoming' && (apt.appointmentDate < todayStr || apt.status === 'completed')) {
      return false;
    }
    if (timeFilter === 'past' && (apt.appointmentDate >= todayStr && apt.status !== 'completed')) {
      return false;
    }

    return true;
  });

  const selectedLocationObj = locations.find((l) => l.id === effectiveLocFilter);

  const handleNextStatus = async (id: string, currentStatus: AppointmentStatus) => {
    let next: AppointmentStatus = 'completed';
    if (currentStatus === 'booked') next = 'checked_in';
    else if (currentStatus === 'checked_in') next = 'waiting';
    else if (currentStatus === 'waiting') next = 'in_consultation';
    else if (currentStatus === 'in_consultation') next = 'completed';

    await updateStatusMutation.mutateAsync({ id, status: next });
    refetch();
  };

  const handleRecordPayment = async (id: string) => {
    await recordPaymentMutation.mutateAsync(id);
    refetch();
  };

  const handleManageQueue = (locId: string) => {
    setActiveLocationFilter(locId);
    setSearchParams({ locId });
  };

  const handleResetFilters = () => {
    setActiveLocationFilter('all');
    setTimeFilter('today');
    setDateFilter('');
    setSearchParams({});
  };

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
            Doctor Dashboard & Queue Control
          </h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            {doctor?.name} ({doctor?.id}) • {doctor?.specialization}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '360px' }}>
          <Button
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
            leftIcon={<Plus size={15} />}
            onClick={() => setIsManualBookingOpen(true)}
          >
            Manual Serial
          </Button>
          <Link to="/doctor/prescriptions/new" style={{ flex: 1 }}>
            <Button variant="accent" size="sm" style={{ width: '100%' }} leftIcon={<FileText size={15} />}>
              Create Rx
            </Button>
          </Link>
        </div>
      </div>

      {/* Multi-Location Global Breakdown */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Today's Practice Locations ({todayAppointments.length} Booked)
          </h2>
          {effectiveLocFilter !== 'all' && (
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Show All Locations
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {locationStats.map((loc) => {
            const isHosp = loc.locationType === 'hospital';
            const isDiag = loc.locationType === 'diagnostic_center';
            const isSelected = effectiveLocFilter === loc.id;

            return (
              <div
                key={loc.id}
                className="card"
                style={{
                  borderTop: `4px solid ${isHosp ? 'var(--primary-800)' : isDiag ? 'var(--accent-600)' : '#E11D48'}`,
                  padding: '1.15rem',
                  backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                  borderColor: isSelected ? 'var(--primary-700)' : 'var(--slate-200)',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)',
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

                <div style={{ marginTop: '0.85rem' }}>
                  <Button
                    size="sm"
                    variant={isSelected ? 'primary' : 'outline'}
                    style={{ width: '100%' }}
                    onClick={() => handleManageQueue(loc.id)}
                  >
                    {isSelected ? 'Active Queue ✓' : 'Manage Queue'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar for Appointments & Queue Table */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {selectedLocationObj ? `Queue: ${selectedLocationObj.institutionName}` : 'All Patient Appointments'}
            </h2>
            <p className="text-xs text-muted">
              {selectedLocationObj ? `${selectedLocationObj.chamberName}` : 'Filter appointments by time range or exact calendar date'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
                Today ({todayAppointments.length})
              </button>
              <button className={`tab-btn ${timeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimeFilter('upcoming')}>
                Upcoming
              </button>
              <button className={`tab-btn ${timeFilter === 'past' ? 'active' : ''}`} onClick={() => setTimeFilter('past')}>
                Past Consultations
              </button>
              <button className={`tab-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
                All Dates ({allAppointments.length})
              </button>
            </div>

            <input
              type="date"
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: '140px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {(effectiveLocFilter !== 'all' || dateFilter || timeFilter !== 'today') && (
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
                <th>Patient</th>
                <th>Location / Chamber</th>
                <th>Date & Time</th>
                <th>Payment (Cash)</th>
                <th>Status</th>
                <th>Queue Action</th>
                <th>Rx</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                    No appointments match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-800)' }}>
                        #{apt.serialNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      <div className="text-xs text-muted">{apt.patientPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.institutionName}</div>
                      <div className="text-xs text-muted">{apt.chamberName}</div>
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
                        {apt.status === 'completed' && (
                          <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Completed</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link to={`/doctor/prescriptions/new?aptId=${apt.id}`}>
                        <Button size="sm" variant="primary">
                          Rx
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedDoctorId={doctorId}
        fixedLocationId={effectiveLocFilter !== 'all' ? effectiveLocFilter : undefined}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
