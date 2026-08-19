import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useDoctor, useStaff, useUpdateAppointmentStatus, useRecordPayment } from '../hooks/useHealthcare';
import { Button, StatusBadge, Modal } from '../components/ui/Core';
import { ManualBookingModal } from '../components/domain/ManualBookingModal';
import { Plus, FileText, Building2, Stethoscope, MapPin, ChevronRight, RotateCcw, Calendar, Users, Edit, Trash2, Phone, User } from 'lucide-react';
import type { AppointmentStatus } from '../types';
import { mockStaff } from '../api/mock/data';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const doctorId = currentUser.doctorId || 'DOC-001';
  const { data: doctor } = useDoctor(doctorId);
  const { data: allAppointments = [], refetch } = useAppointments({ doctorId });
  const { data: staffList = [], refetch: refetchStaff } = useStaff({ assignedDoctorId: doctorId });

  const [searchParams, setSearchParams] = useSearchParams();
  const locIdParam = searchParams.get('locId');

  const updateStatusMutation = useUpdateAppointmentStatus();
  const recordPaymentMutation = useRecordPayment();

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>(locIdParam || 'all');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'queue' | 'staff_management'>('queue');

  // Time & Date Filtering
  const [timeFilter, setTimeFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Chamber Staff Filter
  const [chamberStaffFilter, setChamberStaffFilter] = useState<string>('all');

  // Staff CRUD State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffLocationId, setStaffLocationId] = useState('LOC-001');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = allAppointments.filter((a) => a.appointmentDate === todayStr);

  const locations = doctor?.practiceLocations || [];
  const locationStats = locations.map((loc) => {
    const locApts = todayAppointments.filter((a) => a.practiceLocationId === loc.id);
    const locStaff = mockStaff.filter((s) => s.assignedDoctorId === doctorId && s.assignedLocationId === loc.id);
    return {
      ...loc,
      todayCount: locApts.length,
      waitingCount: locApts.filter((a) => ['booked', 'checked_in', 'waiting'].includes(a.status)).length,
      completedCount: locApts.filter((a) => a.status === 'completed').length,
      staffMembers: locStaff,
    };
  });

  // Filter appointments
  const effectiveLocFilter = locIdParam || activeLocationFilter;
  const filteredAppointments = allAppointments.filter((apt) => {
    if (effectiveLocFilter !== 'all' && apt.practiceLocationId !== effectiveLocFilter) {
      return false;
    }
    if (dateFilter && apt.appointmentDate !== dateFilter) {
      return false;
    }
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

  // Filter staff by Chamber / Location
  const doctorStaff = mockStaff.filter((s) => s.assignedDoctorId === doctorId);
  const filteredStaff = doctorStaff.filter((s) => {
    if (chamberStaffFilter !== 'all' && s.assignedLocationId !== chamberStaffFilter) {
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

  // Staff CRUD handlers
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffPhone('+880 1911 ');
    setStaffEmail('');
    setStaffLocationId(locations[0]?.id || 'LOC-001');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: any) => {
    setEditingStaffId(stf.id);
    setStaffName(stf.name);
    setStaffPhone(stf.phone);
    setStaffEmail(stf.email);
    setStaffLocationId(stf.assignedLocationId || locations[0]?.id || 'LOC-001');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const locObj = locations.find((l) => l.id === staffLocationId);

    if (editingStaffId) {
      const target = mockStaff.find((s) => s.id === editingStaffId);
      if (target) {
        target.name = staffName;
        target.phone = staffPhone;
        target.email = staffEmail;
        target.assignedLocationId = staffLocationId;
        target.assignedChamberName = `${locObj?.chamberName} (${locObj?.institutionName})`;
      }
    } else {
      mockStaff.unshift({
        id: `STF-00${mockStaff.length + 1}`,
        userId: `USR-DSTF-00${mockStaff.length + 1}`,
        name: staffName,
        email: staffEmail || `${staffName.toLowerCase().replace(/[^a-z]/g, '')}@medify247.com`,
        phone: staffPhone,
        role: 'doctor_staff',
        designation: 'Assistant',
        assignedDoctorId: doctorId,
        assignedDoctorName: doctor?.name,
        assignedLocationId: staffLocationId,
        assignedChamberName: `${locObj?.chamberName} (${locObj?.institutionName})`,
        status: 'active',
      });
    }
    setIsStaffModalOpen(false);
    refetchStaff();
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Remove assistant from this chamber?')) {
      const idx = mockStaff.findIndex((s) => s.id === id);
      if (idx !== -1) mockStaff.splice(idx, 1);
      refetchStaff();
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
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
            Doctor Dashboard & Practice Operations
          </h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            {doctor?.name} ({doctor?.id}) • {doctor?.specialization} • {locations.length} Practice Chambers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsManualBookingOpen(true)}
          >
            Manual Serial
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={handleOpenAddStaff}
          >
            Assign Chamber Assistant
          </Button>
          <Link to="/doctor/prescriptions/new">
            <Button variant="accent" size="sm" leftIcon={<FileText size={15} />}>
              Create Rx
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Tab Navigation: Queue Operations vs Chamber Staff Management */}
      <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`tab-btn ${activeDashboardTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveDashboardTab('queue')}
        >
          Practice Chambers & Live Queue ({allAppointments.length})
        </button>
        <button
          className={`tab-btn ${activeDashboardTab === 'staff_management' ? 'active' : ''}`}
          onClick={() => setActiveDashboardTab('staff_management')}
        >
          Chamber Staff & Assistants Management ({doctorStaff.length})
        </button>
      </div>

      {/* TAB 1: PRACTICE CHAMBERS & QUEUE */}
      {activeDashboardTab === 'queue' && (
        <>
          {/* Multi-Location Global Breakdown */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Practice Chambers & Assigned Assistants ({todayAppointments.length} Today)
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

                    {/* Assigned Chamber Assistant badge */}
                    <div style={{ marginTop: '0.65rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                      <span className="text-muted">Chamber Staff: </span>
                      <strong>
                        {loc.staffMembers.length > 0 ? loc.staffMembers.map((s) => s.name.split('(')[0]).join(', ') : 'No staff assigned'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--slate-100)' }}>
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
                    <th>Chamber Location</th>
                    <th>Date & Time</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                        No appointments found for the selected chamber and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-800)' }}>
                            #{apt.serialNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                          <div className="text-xs text-muted">{apt.patientPhone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{apt.chamberName}</div>
                          <div className="text-xs text-muted">{apt.institutionName}</div>
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
                                Waiting
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
                            <Link to={`/doctor/prescriptions/new?patientName=${encodeURIComponent(apt.patientName)}&appointmentId=${apt.id}`}>
                              <Button size="sm" variant="outline">
                                Rx
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: CHAMBER-BASED STAFF MANAGEMENT (CRUD & FILTERING) */}
      {activeDashboardTab === 'staff_management' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Individual Chamber Staff & Assistant Management</h2>
              <p className="text-xs text-muted">Assign dedicated assistants to specific chambers (e.g. Ibn Sina Chamber 204 vs Rahman Medical Private Chamber)</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--primary-800)' }}
                value={chamberStaffFilter}
                onChange={(e) => setChamberStaffFilter(e.target.value)}
              >
                <option value="all">Filter by Chamber (All)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.chamberName} ({loc.institutionName})
                  </option>
                ))}
              </select>

              <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={handleOpenAddStaff}>
                Assign Assistant
              </Button>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Assistant Name</th>
                  <th>Assigned Chamber Room</th>
                  <th>Practice Institution</th>
                  <th>Contact Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((stf) => {
                  const locObj = locations.find((l) => l.id === stf.assignedLocationId);

                  return (
                    <tr key={stf.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color="var(--primary-800)" />
                          <strong>{stf.name}</strong>
                        </div>
                        <div className="text-xs text-muted">{stf.email}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-800)' }}>
                          {stf.assignedChamberName || locObj?.chamberName || 'General Chamber'}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-slate">
                          {locObj?.institutionName || 'Private Practice'}
                        </span>
                      </td>
                      <td>
                        <div><Phone size={12} style={{ display: 'inline', marginRight: '3px' }} />{stf.phone}</div>
                      </td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <Button size="sm" variant="outline" onClick={() => handleOpenEditStaff(stf)}>
                            <Edit size={13} />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteStaff(stf.id)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={editingStaffId ? 'Edit Chamber Assistant' : 'Assign Assistant to Chamber'}>
        <form onSubmit={handleSaveStaff}>
          <div className="form-group">
            <label className="form-label">Assistant Full Name *</label>
            <input type="text" required placeholder="e.g. Sara Khan" className="form-input" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Specific Practice Chamber *</label>
            <select
              className="form-select"
              value={staffLocationId}
              onChange={(e) => setStaffLocationId(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.chamberName} — {loc.institutionName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input type="tel" required placeholder="+880 1911 000000" className="form-input" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="assistant@medify247.com" className="form-input" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingStaffId ? 'Save Changes' : 'Assign Assistant'}</Button>
          </div>
        </form>
      </Modal>

      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        fixedDoctorId={doctorId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
