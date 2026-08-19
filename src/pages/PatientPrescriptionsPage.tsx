import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePrescriptions, usePrescription } from '../hooks/useHealthcare';
import { useAuth } from '../context/AuthContext';
import { PrescriptionViewer } from '../components/domain/PrescriptionViewer';
import { Button } from '../components/ui/Core';
import { FileText, ChevronLeft, Download } from 'lucide-react';

export const PatientPrescriptionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { data: prescriptions = [], isLoading } = usePrescriptions({
    patientId: currentUser.patientId || 'PAT-001',
  });
  const { data: selectedPrescription } = usePrescription(id);

  if (id && selectedPrescription) {
    return (
      <div className="container page-wrapper" style={{ maxWidth: '900px' }}>
        <Link
          to="/patient/prescriptions"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)', marginBottom: '1.5rem', fontWeight: 500 }}
        >
          <ChevronLeft size={16} /> Back to Prescriptions List
        </Link>
        <PrescriptionViewer prescription={selectedPrescription} />
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Prescriptions</h1>
        <p className="text-muted" style={{ marginTop: '0.2rem' }}>
          Access and print your verified prescriptions with official hospital & chamber headers.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '140px' }} />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No Prescriptions Found</h3>
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
            When a doctor completes your consultation, your digital prescription will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="card card-hover"
              style={{
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {rx.snapshot.doctorName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                    {rx.snapshot.locationType.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <p style={{ color: 'var(--primary-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {rx.snapshot.doctorSpecialization}
                </p>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  🏥 {rx.snapshot.institutionName} • Issued on {rx.date}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', marginTop: '0.5rem' }}>
                  <strong>Diagnosis:</strong> {rx.diagnosis} ({rx.medicines.length} medicines)
                </p>
              </div>

              <Link to={`/patient/prescriptions/${rx.id}`}>
                <Button variant="primary" size="sm" leftIcon={<FileText size={15} />}>
                  View & Print
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
