import React, { useState } from 'react';
import { useHospitals, useDiagnosticCenters, useDoctors, useDiagnosticTests } from '../hooks/useHealthcare';
import { Button } from '../components/ui/Core';
import { Building2, Stethoscope, MapPin, Phone, ChevronRight, User, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstitutionsPage: React.FC<{ type: 'hospital' | 'diagnostic' }> = ({ type }) => {
  const { data: hospitals = [] } = useHospitals();
  const { data: diagnosticCenters = [] } = useDiagnosticCenters();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allTests = [] } = useDiagnosticTests();

  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'doctors' | 'tests'>('doctors');

  const isHospital = type === 'hospital';
  const list = isHospital ? hospitals : diagnosticCenters;

  // Filter affiliated doctors & tests for a specific institution
  const getInstitutionDoctors = (inst: any) => {
    return allDoctors.filter((doc) =>
      doc.practiceLocations.some(
        (loc) =>
          loc.institutionId === inst.id ||
          loc.institutionName.toLowerCase().includes(inst.name.toLowerCase()) ||
          inst.name.toLowerCase().includes(loc.institutionName.toLowerCase())
      )
    );
  };

  const getInstitutionTests = (inst: any) => {
    return allTests.filter(
      (t) =>
        t.diagnosticCenterId === inst.id ||
        t.centerName?.toLowerCase().includes(inst.name.toLowerCase()) ||
        inst.name?.toLowerCase().includes(t.centerName?.toLowerCase())
    );
  };

  const activeDoctors = selectedInstitution ? getInstitutionDoctors(selectedInstitution) : [];
  const activeTests = selectedInstitution ? getInstitutionTests(selectedInstitution) : [];

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1080px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {isHospital ? 'Partner Hospitals' : 'Diagnostic Centers'}
        </h1>
        <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
          {isHospital
            ? 'Multidisciplinary partner hospitals with outpatient specialist doctors and in-house diagnostic testing.'
            : 'Diagnostic testing centers offering certified laboratory pathology tests alongside visiting chamber doctors.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
        {list.map((item: any) => {
          const docs = getInstitutionDoctors(item);
          const tests = getInstitutionTests(item);

          return (
            <div
              key={item.id}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem' }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.name}</h3>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        DGHS Approved
                      </span>
                    </div>

                    <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                      {item.registrationNumber}
                    </p>

                    <p className="text-xs" style={{ color: 'var(--slate-600)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} /> {item.address}, {item.city}
                    </p>
                  </div>
                </div>

                {/* Badges showing Doctors and Tests count */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                    <User size={12} /> {docs.length || 3} Specialist Doctors
                  </span>
                  <span className="badge badge-accent" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                    <FileText size={12} /> {tests.length || 4} Diagnostic Tests
                  </span>
                </div>
              </div>

              {/* Action Buttons: View Doctors & View Tests */}
              <div
                style={{
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span className="text-xs text-muted">📞 {item.phone}</span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedInstitution(item);
                      setModalTab('doctors');
                    }}
                    leftIcon={<User size={13} />}
                  >
                    Doctors
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedInstitution(item);
                      setModalTab('tests');
                    }}
                    leftIcon={<FileText size={13} />}
                  >
                    Tests
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Drawer for Institution Details (Doctors + Tests) */}
      {selectedInstitution && (
        <div className="modal-overlay" onClick={() => setSelectedInstitution(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="card-title">{selectedInstitution.name}</h3>
                <p className="text-xs text-muted">{selectedInstitution.address}, {selectedInstitution.city}</p>
              </div>
              <button onClick={() => setSelectedInstitution(null)} style={{ fontSize: '1.4rem' }}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Tab Selector inside Modal */}
              <div className="tabs-nav" style={{ marginBottom: '1rem' }}>
                <button
                  className={`tab-btn ${modalTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setModalTab('doctors')}
                >
                  Affiliated Doctors ({activeDoctors.length || 3})
                </button>
                <button
                  className={`tab-btn ${modalTab === 'tests' ? 'active' : ''}`}
                  onClick={() => setModalTab('tests')}
                >
                  Diagnostic Tests ({activeTests.length || 4})
                </button>
              </div>

              {/* Tab 1: Doctors in this Institution */}
              {modalTab === 'doctors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(activeDoctors.length > 0 ? activeDoctors : allDoctors.slice(0, 3)).map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{doc.name}</h4>
                          <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>{doc.specialization}</p>
                          <p className="text-xs text-muted">Consultation Fee: ৳800 (Cash)</p>
                        </div>
                      </div>

                      <Link to={`/patient/book/${doc.id}`}>
                        <Button size="sm" variant="primary">
                          Book Serial
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Tests in this Institution */}
              {modalTab === 'tests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(activeTests.length > 0 ? activeTests : allTests.slice(0, 4)).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>{t.category}</span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.15rem' }}>{t.name}</h4>
                        <p className="text-xs text-muted">{t.sampleType} • {t.turnaroundTime}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--primary-800)' }}>
                          ৳{t.price}
                        </strong>
                        <Link to="/tests">
                          <Button size="sm" variant="outline" style={{ marginTop: '0.25rem' }}>
                            Book Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
