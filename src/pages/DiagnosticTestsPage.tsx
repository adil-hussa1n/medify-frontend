import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDiagnosticTests, useCreateDiagnosticOrder } from '../hooks/useHealthcare';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Modal } from '../components/ui/Core';
import { Search, Home, Building2, Clock, CheckCircle2, Stethoscope, AlertCircle } from 'lucide-react';
import { DiagnosticTest } from '../types';

export const DiagnosticTestsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [bookingTest, setBookingTest] = useState<DiagnosticTest | null>(null);

  const { data: tests = [], isLoading } = useDiagnosticTests({ search: search || undefined });
  const createOrderMutation = useCreateDiagnosticOrder();
  const { currentUser } = useAuth();

  // Booking Modal State
  const [bookingType, setBookingType] = useState<'walk_in' | 'home_collection'>('walk_in');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 11:00 AM');
  const [address, setAddress] = useState('Dhanmondi, Dhaka');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const handleBookTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTest) return;

    try {
      const res = await createOrderMutation.mutateAsync({
        patientId: currentUser.patientId || 'PAT-001',
        patientName: currentUser.name || 'Tahmid Hasan',
        patientPhone: currentUser.phone || '+880 1711 000111',
        patientAddress: bookingType === 'home_collection' ? address : undefined,
        diagnosticCenterId: bookingTest.diagnosticCenterId,
        testId: bookingTest.id,
        bookingType,
        scheduledDate,
        timeSlot,
      });

      setOrderSuccess(res);
    } catch (err: any) {
      alert(err.message || 'Order failed');
    }
  };

  const closeBookingModal = () => {
    setBookingTest(null);
    setOrderSuccess(null);
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Diagnostic Tests Catalog</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          Search individual diagnostic tests, compare prices, and choose walk-in or home sample collection.
        </p>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Search size={20} color="var(--slate-400)" />
        <input
          type="text"
          placeholder="Search test name (e.g. CBC, Lipid Profile, ECG, Thyroid, X-Ray)..."
          className="form-input"
          style={{ border: 'none', padding: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Stethoscope size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No Diagnostic Tests Found</h3>
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
            Try searching for another test keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Badge variant="primary" className="text-xs">
                    {test.category}
                  </Badge>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    ৳{test.price}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.6rem', color: 'var(--slate-900)' }}>
                  {test.name}
                </h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  🏥 {test.centerName}
                </p>
                <p className="text-sm text-muted" style={{ marginTop: '0.6rem', lineHeight: 1.5 }}>
                  {test.description}
                </p>

                <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span><strong>Prep:</strong> {test.preparationInstructions}</span>
                  <span><strong>Turnaround:</strong> {test.turnaroundTime}</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {test.homeCollectionAvailable ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--accent-600)', fontWeight: 600 }}>
                      <Home size={14} /> Home Collection Available
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      <Building2 size={14} /> Walk-in Center Only
                    </span>
                  )}
                </div>

                <Button size="sm" variant="primary" onClick={() => setBookingTest(test)}>
                  Book Test
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Booking Modal */}
      <Modal
        isOpen={!!bookingTest}
        onClose={closeBookingModal}
        title={orderSuccess ? 'Test Booked Successfully' : `Book Test: ${bookingTest?.name}`}
        maxWidth="520px"
      >
        {orderSuccess ? (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order Received!</h3>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              Order Number: <strong>{orderSuccess.orderNumber}</strong>
            </p>

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
              <p><strong>Test:</strong> {orderSuccess.testName}</p>
              <p><strong>Center:</strong> {orderSuccess.centerName}</p>
              <p><strong>Mode:</strong> {orderSuccess.bookingType === 'home_collection' ? '🏠 Home Sample Collection' : '🏥 Center Walk-in'}</p>
              <p><strong>Scheduled:</strong> {orderSuccess.scheduledDate} ({orderSuccess.timeSlot})</p>
              <p style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                Total: ৳{orderSuccess.testPrice} (Cash on Collection/Visit)
              </p>
            </div>

            <Button variant="primary" onClick={closeBookingModal}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookTest}>
            <div style={{ marginBottom: '1.25rem', backgroundColor: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-900)' }}>{bookingTest?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)' }}>
                {bookingTest?.centerName} • Fee: ৳{bookingTest?.price} (Cash)
              </div>
            </div>

            {/* Mode selection */}
            <div className="form-group">
              <label className="form-label">Booking Mode *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setBookingType('walk_in')}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${bookingType === 'walk_in' ? 'var(--primary-800)' : 'var(--slate-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: bookingType === 'walk_in' ? 'var(--primary-50)' : 'var(--white)',
                    textAlign: 'center',
                  }}
                >
                  <Building2 size={20} style={{ margin: '0 auto 0.25rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Walk-in Center</div>
                </div>

                <div
                  onClick={() => bookingTest?.homeCollectionAvailable && setBookingType('home_collection')}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${bookingType === 'home_collection' ? 'var(--primary-800)' : 'var(--slate-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: bookingTest?.homeCollectionAvailable ? 'pointer' : 'not-allowed',
                    opacity: bookingTest?.homeCollectionAvailable ? 1 : 0.5,
                    backgroundColor: bookingType === 'home_collection' ? 'var(--primary-50)' : 'var(--white)',
                    textAlign: 'center',
                  }}
                >
                  <Home size={20} style={{ margin: '0 auto 0.25rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Home Collection</div>
                </div>
              </div>
            </div>

            {bookingType === 'home_collection' && (
              <div className="form-group">
                <label className="form-label">Home Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 14, Road 8, Dhanmondi"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time *</label>
                <select
                  className="form-select"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={closeBookingModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createOrderMutation.isPending}
              >
                Confirm Test Booking
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
