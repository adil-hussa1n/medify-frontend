import React, { useState } from 'react';
import { useDoctors, useCreateAppointment } from '../../hooks/useHealthcare';
import { Modal, Button } from '../ui/Core';
import { AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedDoctorId?: string;
  fixedLocationId?: string;
  onSuccess?: () => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  isOpen,
  onClose,
  fixedDoctorId,
  fixedLocationId,
  onSuccess,
}) => {
  const { data: doctors = [] } = useDoctors();
  const createAptMutation = useCreateAppointment();

  const [selectedDoctorId, setSelectedDoctorId] = useState(fixedDoctorId || (doctors[0]?.id ?? ''));
  const [selectedLocId, setSelectedLocId] = useState(fixedLocationId || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const selectedDoc = doctors.find((d) => d.id === (fixedDoctorId || selectedDoctorId));
  const availableLocations = selectedDoc?.practiceLocations || [];
  const currentLocId = fixedLocationId || selectedLocId || availableLocations[0]?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!selectedDoc || !currentLocId) {
      alert('Please select a doctor and practice location');
      return;
    }

    try {
      const result = await createAptMutation.mutateAsync({
        patientId: `PAT-WALK-${Date.now()}`,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        doctorId: selectedDoc.id,
        practiceLocationId: currentLocId,
        appointmentDate,
        notes,
      });

      setBookingSuccess(result);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code === 'BOOKING_CONFLICT' || err.message?.includes('just booked')) {
        setConflictError('This serial was just booked by another patient. Please try booking again to get the next serial.');
      } else {
        setConflictError(err.message || 'Unable to complete booking. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setBookingSuccess(null);
    setConflictError(null);
    setPatientName('');
    setPatientPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Manual Appointment Booking"
      maxWidth="540px"
    >
      {bookingSuccess ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Appointment Booked Successfully
          </h3>
          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              margin: '1.25rem 0',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            <p><strong>Patient:</strong> {bookingSuccess.patientName} ({bookingSuccess.patientPhone})</p>
            <p><strong>Doctor:</strong> {bookingSuccess.doctorName}</p>
            <p><strong>Location:</strong> {bookingSuccess.institutionName} ({bookingSuccess.chamberName})</p>
            <p><strong>Date:</strong> {bookingSuccess.appointmentDate}</p>
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px dashed var(--slate-300)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                Serial Number: #{bookingSuccess.serialNumber}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                Fee: ৳{bookingSuccess.consultationFee} (Cash)
              </span>
            </div>
          </div>
          <Button variant="primary" onClick={handleReset}>
            Done / Book Another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {conflictError && (
            <div
              style={{
                backgroundColor: 'var(--danger-50)',
                border: '1px solid #FECACA',
                color: 'var(--danger-600)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{conflictError}</span>
            </div>
          )}

          {/* Patient Details */}
          <div className="form-group">
            <label className="form-label">Patient Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mahfuzur Rahman"
              className="form-input"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+880 17..."
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

          {/* Doctor & Location Selection (if not fixed) */}
          {!fixedDoctorId && (
            <div className="form-group">
              <label className="form-label">Select Doctor *</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!fixedLocationId && (
            <div className="form-group">
              <label className="form-label">Practice Location / Chamber *</label>
              <select
                className="form-select"
                value={currentLocId}
                onChange={(e) => setSelectedLocId(e.target.value)}
              >
                {availableLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.institutionName} - {l.chamberName} (৳{l.consultationFee})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Appointment Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Visit Notes / Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Chest pain follow-up, Routine consultation"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createAptMutation.isPending}
              leftIcon={<UserCheck size={16} />}
            >
              Book & Issue Serial
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
