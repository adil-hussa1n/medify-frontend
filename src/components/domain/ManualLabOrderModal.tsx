import React, { useState } from 'react';
import { useDiagnosticTests, useCreateDiagnosticOrder } from '../../hooks/useHealthcare';
import { Modal, Button } from '../ui/Core';
import { FlaskConical, CheckCircle2, User, Phone, MapPin, Calendar, Clock, DollarSign, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ManualLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId?: string;
  institutionName?: string;
  onSuccess?: () => void;
}

export const ManualLabOrderModal: React.FC<ManualLabOrderModalProps> = ({
  isOpen,
  onClose,
  institutionId = 'HOSP-001',
  institutionName = 'Ibn Sina Specialized Hospital',
  onSuccess,
}) => {
  const { data: allTests = [] } = useDiagnosticTests();
  const createOrderMutation = useCreateDiagnosticOrder();

  // Filter tests available for this institution
  const availableTests = allTests.filter(
    (t) =>
      t.diagnosticCenterId === institutionId ||
      (institutionId === 'HOSP-001' && (t.diagnosticCenterId === 'HOSP-001' || t.centerName?.toLowerCase().includes('ibn sina') || t.id.startsWith('TEST-001') || t.id.startsWith('TEST-002') || t.id.startsWith('TEST-003')))
  );

  const displayTests = availableTests.length > 0 ? availableTests : allTests.slice(0, 5);

  const [selectedTestId, setSelectedTestId] = useState<string>(displayTests[0]?.id || 'TEST-001');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+880 1');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientAddress, setPatientAddress] = useState('Dhanmondi, Dhaka');
  const [bookingType, setBookingType] = useState<'walk_in' | 'home_collection'>('walk_in');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:30 AM');
  const [paymentReceived, setPaymentReceived] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const selectedTest = allTests.find((t) => t.id === selectedTestId) || displayTests[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTest) {
      alert('Please select a valid diagnostic test.');
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        patientId: `PAT-WALK-${Date.now()}`,
        patientName,
        patientPhone,
        patientAddress: bookingType === 'home_collection' ? patientAddress : undefined,
        diagnosticCenterId: institutionId,
        testId: selectedTest.id,
        bookingType,
        scheduledDate,
        timeSlot,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      setBookingSuccess(result);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to create manual lab order.');
    }
  };

  const handleReset = () => {
    setBookingSuccess(null);
    setPatientName('');
    setPatientPhone('+880 1');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={bookingSuccess ? 'Lab Order Registered' : 'Manual Lab Test Registration'}
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
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Lab Investigation Registered!
          </h3>
          <p className="text-muted text-xs" style={{ marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            New sample tracking entry has been added to the active laboratory queue.
          </p>

          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className="text-xs text-muted">Order Number:</span>
              <strong style={{ color: 'var(--accent-600)' }}>{bookingSuccess.orderNumber || '#ORD-NEW'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className="text-xs text-muted">Patient Name:</span>
              <strong>{patientName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className="text-xs text-muted">Test Name:</span>
              <strong>{selectedTest?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className="text-xs text-muted">Scheduled For:</span>
              <span>{scheduledDate} • {timeSlot}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '0.6rem' }}>
              <span className="text-xs text-muted">Investigation Fee:</span>
              <strong style={{ color: 'var(--primary-800)', fontSize: '1.05rem' }}>৳{selectedTest?.price} Cash (Paid)</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button variant="primary" onClick={handleReset}>
              Done & Return to Queue
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Institution Header Tag */}
          <div
            style={{
              backgroundColor: 'var(--accent-50)',
              border: '1px solid var(--accent-200)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <FlaskConical size={20} color="var(--accent-600)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-900)' }}>
                {institutionName} — Pathology Desk
              </div>
              <div className="text-xs text-muted">Direct Front-Desk Sample Registration</div>
            </div>
          </div>

          {/* Test Selector */}
          <div className="form-group">
            <label className="form-label">Diagnostic Test / Investigation *</label>
            <select
              className="form-select"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              required
            >
              {displayTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — ৳{t.price} ({t.category})
                </option>
              ))}
            </select>
            {selectedTest && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span className="text-xs text-muted">Sample: {selectedTest.sampleType}</span>
                <span className="text-xs" style={{ color: 'var(--primary-800)', fontWeight: 700 }}>
                  Test Fee: ৳{selectedTest.price}
                </span>
              </div>
            )}
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Anisul Haque"
                className="form-input"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                required
                placeholder="+880 1711 000000"
                className="form-input"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input
                type="number"
                min={1}
                max={120}
                className="form-input"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Order Type</label>
              <select
                className="form-select"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as any)}
              >
                <option value="walk_in">Hospital Walk-In</option>
                <option value="home_collection">Home Collection</option>
              </select>
            </div>
          </div>

          {bookingType === 'home_collection' && (
            <div className="form-group">
              <label className="form-label">Patient Home Address for Phlebotomist *</label>
              <input
                type="text"
                required
                placeholder="House, Road, Area, Dhaka"
                className="form-input"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
              />
            </div>
          )}

          {/* Schedule Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Scheduled Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Slot</label>
              <input
                type="text"
                required
                placeholder="e.g. 09:30 AM"
                className="form-input"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Collection Toggle */}
          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>
                Collect Cash at Desk (৳{selectedTest?.price || 500})
              </span>
              <span className="text-xs text-muted">Includes ৳20 Medify platform processing fee</span>
            </div>
            <input
              type="checkbox"
              id="payCheck"
              checked={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createOrderMutation.isPending}
              leftIcon={<Plus size={15} />}
            >
              Confirm Lab Order
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
