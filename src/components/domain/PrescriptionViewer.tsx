import React from 'react';
import { Prescription } from '../../types';
import { Button } from '../ui/Core';
import { Printer, Download, Building2, Stethoscope, FileText } from 'lucide-react';

interface PrescriptionViewerProps {
  prescription: Prescription;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  prescription,
  onPrint,
  onDownload,
}) => {
  const { snapshot, vitals, symptoms, diagnosis, advisedTests, medicines, adviceInstructions, nextFollowUpDate } =
    prescription;

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const handleDownload = () => {
    if (onDownload) onDownload();
    else alert('Simulating PDF download for: Prescription #' + prescription.id);
  };

  const isHospital = snapshot.locationType === 'hospital';
  const isDiagnostic = snapshot.locationType === 'diagnostic_center';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Action Bar (Not printed) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--white)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--primary-700)" />
          <span style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
            Rx (#{prescription.id})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="outline" leftIcon={<Printer size={15} />} onClick={handlePrint}>
            Print
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Download size={15} />} onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Prescription Sheet (Branded Printable Document) */}
      <div
        className="prescription-sheet"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--slate-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '600px',
          color: '#1E293B',
          position: 'relative',
        }}
      >
        {/* CASE A & B: Hospital / Diagnostic Branded Header */}
        {(isHospital || isDiagnostic) && (
          <div
            style={{
              borderBottom: '2px solid var(--primary-800)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isHospital ? <Building2 size={22} color="var(--primary-800)" /> : <Stethoscope size={22} color="var(--accent-600)" />}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {snapshot.institutionName}
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                {snapshot.institutionAddress} • Tel: {snapshot.institutionPhone}
              </p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-700)', marginTop: '0.1rem' }}>
                {snapshot.chamberName}
              </p>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--slate-200)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {snapshot.doctorName}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                {snapshot.doctorSpecialization} • {snapshot.doctorQualifications.join(', ')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                {snapshot.doctorRegistration}
              </p>
            </div>
          </div>
        )}

        {/* CASE C: Individual Chamber Branded Header */}
        {!isHospital && !isDiagnostic && (
          <div
            style={{
              borderBottom: '2px solid var(--primary-800)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {snapshot.doctorName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600 }}>
              {snapshot.doctorSpecialization}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              {snapshot.doctorQualifications.join(', ')} • {snapshot.doctorRegistration}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
              📍 {snapshot.institutionName} • {snapshot.institutionAddress}
            </p>
          </div>
        )}

        {/* Patient Bar */}
        <div
          style={{
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <span className="text-muted">Patient: </span>
            <strong>{prescription.patientName}</strong>
          </div>
          <div>
            <span className="text-muted">Age/Gender: </span>
            <strong>{prescription.patientAge}Y / {prescription.patientGender.toUpperCase()}</strong>
          </div>
          <div>
            <span className="text-muted">Date: </span>
            <strong>{prescription.date}</strong>
          </div>
        </div>

        {/* Vitals Summary Strip */}
        {vitals && Object.values(vitals).some(Boolean) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--primary-100)',
            }}
          >
            {vitals.bloodPressure && <span><strong>BP:</strong> {vitals.bloodPressure}</span>}
            {vitals.pulse && <span><strong>Pulse:</strong> {vitals.pulse}</span>}
            {vitals.weight && <span><strong>Weight:</strong> {vitals.weight}</span>}
            {vitals.temperature && <span><strong>Temp:</strong> {vitals.temperature}</span>}
            {vitals.spo2 && <span><strong>SpO2:</strong> {vitals.spo2}</span>}
          </div>
        )}

        {/* Prescription Body Layout: Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Clinical Findings */}
          <div>
            {symptoms.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Symptoms / Complaints
                </h5>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                  {symptoms.map((s, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {diagnosis && (
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Clinical Diagnosis
                </h5>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  {diagnosis}
                </p>
              </div>
            )}

            {advisedTests.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Advised Tests
                </h5>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                  {advisedTests.map((t, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Rx Medications */}
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-800)', fontFamily: 'serif', marginBottom: '0.5rem' }}>
              ℞
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {medicines.map((med, idx) => (
                <div key={med.id || idx} style={{ borderBottom: '1px dashed var(--slate-200)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                      {idx + 1}. {med.name}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                      {med.duration}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '0.15rem' }}>
                    {med.dosage} • {med.frequency}
                  </div>
                  {med.instructions && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                      {med.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {adviceInstructions.length > 0 && (
              <div style={{ marginTop: '1.25rem', backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Advice & Instructions
                </h5>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                  {adviceInstructions.map((adv, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}

            {nextFollowUpDate && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                Next Follow-Up: {nextFollowUpDate}
              </div>
            )}
          </div>
        </div>

        {/* Footer Signature */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div className="text-xs text-muted">
            Medify247 Digital Systems • {prescription.date}
          </div>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderBottom: '1px solid var(--slate-800)', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '1rem', color: 'var(--primary-900)' }}>
                {snapshot.doctorName}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-600)', fontWeight: 600 }}>
              Authorized Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
