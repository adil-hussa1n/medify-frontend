import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctor, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, FileText, Building2, Stethoscope, MapPin, ChevronRight, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const doctorId = currentUser.doctorId || 'DOC-001';
  const { data: doctor } = useDoctor(doctorId);
  const { data: allAppointments = [], refetch } = useAppointments({ doctorId });

  const [searchParams, setSearchParams] = useSearchParams();
  const locIdParam = searchParams.get('locId');
  const navigate = useNavigate();

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>(locIdParam || 'all');
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

  // Filter appointments by selected location or location type
  const effectiveLocFilter = locIdParam || activeLocationFilter;
  const filteredAppointments = allAppointments.filter((apt) => {
    if (effectiveLocFilter !== 'all' && apt.practiceLocationId !== effectiveLocFilter) {
      return false;
    }
    if (activeTab === 'all') return true;
    return apt.locationType === activeTab;
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

  const handleResetLocationFilter = () => {
    setActiveLocationFilter('all');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Today's Practice Locations ({todayAppointments.length} Booked)
          </h2>
          {effectiveLocFilter !== 'all' && (
            <Button size="sm" variant="outline" onClick={handleResetLocationFilter}>
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

      {/* Appointment Filter Tabs & Active Patient Queue Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {selectedLocationObj ? `Active Queue: ${selectedLocationObj.institutionName}` : 'All Practice Locations Queue'}
            </h2>
            <p className="text-xs text-muted">
              {selectedLocationObj ? `${selectedLocationObj.chamberName} • Serial progression control` : 'Appointments clearly tagged by practice location'}
            </p>
          </div>

          {effectiveLocFilter !== 'all' && (
            <span className="badge badge-primary" style={{ padding: '0.35rem 0.75rem' }}>
              Filtered: {selectedLocationObj?.institutionName}
            </span>
          )}
        </div>

        {effectiveLocFilter === 'all' && (
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
              Private Chamber
            </button>
          </div>
        )}

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
                    No appointments booked for this location today.
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
