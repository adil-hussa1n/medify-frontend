import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDoctor, useCreateAppointment } from '../hooks/useHealthcare';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Core';
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

export const AppointmentBookingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const initialLocId = searchParams.get('locId');

  const { data: doctor, isLoading } = useDoctor(doctorId);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const createAptMutation = useCreateAppointment();

  const [selectedLocId, setSelectedLocId] = useState(initialLocId || '');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientName, setPatientName] = useState(currentUser.name || 'Tahmid Hasan');
  const [patientPhone, setPatientPhone] = useState(currentUser.phone || '+880 1711 000111');
  const [patientAge, setPatientAge] = useState(34);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [notes, setNotes] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null);

  const locations = doctor?.practiceLocations || [];
  const activeLocation = locations.find((l) => l.id === (selectedLocId || locations[0]?.id)) || locations[0];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !activeLocation) return;
    setConflictError(null);

    try {
      const result = await createAptMutation.mutateAsync({
        patientId: currentUser.patientId || 'PAT-001',
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        doctorId: doctor.id,
        practiceLocationId: activeLocation.id,
        appointmentDate,
        notes,
      });

      setBookedAppointment(result);
    } catch (err: any) {
      if (err.code === 'BOOKING_CONFLICT' || err.message?.includes('just booked')) {
        setConflictError('This serial was just booked by another patient. Please click Confirm Booking again to get the next serial.');
      } else {
        setConflictError(err.message || 'Booking could not be processed.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container page-wrapper">
        <div className="card skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container page-wrapper text-center">
        <h2>Doctor Not Found</h2>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: '800px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-600)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      {bookedAppointment ? (
        <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-50)',
              color: 'var(--success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Appointment Booked!</h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
            Your serial number is confirmed. Please bring cash for the fee.
          </p>

          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px dashed var(--slate-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              margin: '1.5rem auto',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="text-xs text-muted" style={{ display: 'block' }}>YOUR SERIAL</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-800)', lineHeight: 1.1 }}>
                  #{bookedAppointment.serialNumber}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="text-xs text-muted" style={{ display: 'block' }}>ESTIMATED TIME</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  {bookedAppointment.estimatedTime}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
              <p><strong>Doctor:</strong> {bookedAppointment.doctorName}</p>
              <p><strong>Location:</strong> {bookedAppointment.institutionName}</p>
              <p><strong>Chamber:</strong> {bookedAppointment.chamberName}</p>
              <p><strong>Date:</strong> {bookedAppointment.appointmentDate}</p>
              <p><strong>Fee:</strong> ৳{bookedAppointment.consultationFee} (Cash on arrival)</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="primary" onClick={() => navigate(`/patient/appointments/${bookedAppointment.id}`)}>
              View Appointment & Live Queue
            </Button>
            <Button variant="outline" onClick={() => navigate('/patient')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              Book Serial Appointment
            </h1>
            <p className="text-muted text-xs" style={{ marginBottom: '1.25rem' }}>
              Choose your practice location & date to receive your confirmed serial.
            </p>

            {conflictError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-50)',
                  border: '1px solid #FECACA',
                  color: 'var(--danger-600)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{conflictError}</span>
              </div>
            )}

            {/* Doctor Info Banner */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                backgroundColor: 'var(--slate-50)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--slate-200)',
              }}
            >
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{doctor.name}</div>
                <div style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {doctor.specialization}
                </div>
              </div>
            </div>

            {/* Step 1: Location Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">1. Choose Practice Location *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {locations.map((loc) => {
                  const isSelected = (selectedLocId || locations[0]?.id) === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocId(loc.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? 'var(--primary-800)' : 'var(--slate-200)'}`,
                        backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                          {loc.institutionName}
                        </div>
                        <div className="text-xs text-muted">
                          {loc.chamberName} • {loc.scheduleDays.slice(0, 2).join(', ')} ({loc.startTime} - {loc.endTime})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                          ৳{loc.consultationFee}
                        </span>
                        <span className="text-xs text-muted" style={{ display: 'block' }}>Cash</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">2. Select Consultation Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            {/* Step 3: Patient Information */}
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                3. Patient Details
              </h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className="form-input"
                    value={patientAge}
                    onChange={(e) => setPatientAge(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain follow-up"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">Consultation Fee</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                  ৳{activeLocation?.consultationFee || 0} <span className="text-xs text-muted font-normal">(Cash on Visit)</span>
                </span>
              </div>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                style={{ width: '100%' }}
                isLoading={createAptMutation.isPending}
              >
                Confirm & Receive Serial
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
