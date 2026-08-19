import React, { useState } from 'react';
import { useHospitals, useDiagnosticCenters, useDoctors, useDiagnosticTests } from '../hooks/useHealthcare';
import { Button } from '../components/ui/Core';
import { Building2, Stethoscope, MapPin, Phone, ChevronRight, User, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstitutionsPage: React.FC<{ type: 'hospital' | 'diagnostic' }> = ({ type }) => {
  const { data: hospitals = [] } = useHospitals();
  const { data: diagnosticCenters = [] } = useDiagnosticCenters();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allTests = [] } = useDiagnosticTests();

  const isHospital = type === 'hospital';
  const list = isHospital ? hospitals : diagnosticCenters;

  // Active tab per institution ID: { [instId]: 'doctors' | 'tests' }
  const [activeTabs, setActiveTabs] = useState<Record<string, 'doctors' | 'tests'>>({});

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

  const handleTabChange = (instId: string, tab: 'doctors' | 'tests') => {
    setActiveTabs((prev) => ({ ...prev, [instId]: tab }));
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1160px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isHospital ? 'Partner Hospitals Directory' : 'Diagnostic Centers Directory'}
        </h1>
        <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
          {isHospital
            ? 'Full multidisciplinary partner hospital facilities with direct access to chamber specialists and diagnostic testing.'
            : 'Certified diagnostic testing centers offering pathology laboratory investigations alongside visiting chamber specialists.'}
        </p>
      </div>

      {/* Full-Width Large Coverage Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {list.map((item: any) => {
          const docs = getInstitutionDoctors(item);
          const tests = getInstitutionTests(item);
          const currentTab = activeTabs[item.id] || 'doctors';

          const displayedDocs = docs.length > 0 ? docs : allDoctors.slice(0, 3);
          const displayedTests = tests.length > 0 ? tests : allTests.slice(0, 4);

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--white)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Institution Header Information Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--slate-100)',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'cover',
                      border: '1px solid var(--slate-200)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {item.name}
                      </h2>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        DGHS Verified
                      </span>
                    </div>

                    <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                      {item.registrationNumber} • {item.city}
                    </p>

                    <p className="text-xs" style={{ color: 'var(--slate-600)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} color="var(--primary-700)" /> {item.address}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                    <User size={13} /> {displayedDocs.length} Specialist Doctors
                  </span>
                  <span className="badge badge-accent" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                    <FileText size={13} /> {displayedTests.length} Pathology Tests
                  </span>
                </div>
              </div>

              {/* In-Card Tabs Selector: Doctors vs Tests */}
              <div className="tabs-nav" style={{ marginBottom: '1.25rem' }}>
                <button
                  className={`tab-btn ${currentTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id, 'doctors')}
                  style={{ fontSize: '0.95rem' }}
                >
                  Affiliated Doctors ({displayedDocs.length})
                </button>
                <button
                  className={`tab-btn ${currentTab === 'tests' ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id, 'tests')}
                  style={{ fontSize: '0.95rem' }}
                >
                  Diagnostic Tests Catalog ({displayedTests.length})
                </button>
              </div>

              {/* Tab 1: Doctors in Full Page Grid */}
              {currentTab === 'doctors' && (
                <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
                  {displayedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--slate-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.name}
                          </h4>
                          <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600 }}>
                            {doc.specialization}
                          </p>
                          <p className="text-xs text-muted">
                            Chamber 204 • Fee: ৳800
                          </p>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.65rem' }}>
                        <Link to={`/patient/book/${doc.id}`} style={{ display: 'block' }}>
                          <Button size="sm" variant="primary" style={{ width: '100%' }}>
                            Book Serial
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Diagnostic Tests in Full Page Grid */}
              {currentTab === 'tests' && (
                <div className="grid grid-cols-4 md-grid-cols-2 sm-grid-cols-1 gap-3">
                  {displayedTests.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--slate-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                            {t.category}
                          </span>
                          <strong style={{ color: 'var(--primary-800)', fontSize: '1rem' }}>
                            ৳{t.price}
                          </strong>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.25 }}>
                          {t.name}
                        </h4>
                        <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                          {t.sampleType} • {t.turnaroundTime}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.65rem' }}>
                        <Link to="/tests" style={{ display: 'block' }}>
                          <Button size="sm" variant="outline" style={{ width: '100%', minHeight: '34px', fontSize: '0.8rem' }}>
                            Book Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
