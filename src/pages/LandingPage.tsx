import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDoctors, useHospitals, useDiagnosticCenters, useDiagnosticTests } from '../hooks/useHealthcare';
import { Button, Badge } from '../components/ui/Core';
import {
  Search,
  Calendar,
  ShieldCheck,
  Clock,
  ChevronRight,
  Stethoscope,
  Building2,
  FileCheck2,
  MapPin,
  Home,
  CheckCircle2,
  Phone,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredDoctors = [] } = useDoctors();
  const { data: hospitals = [] } = useHospitals();
  const { data: diagnosticCenters = [] } = useDiagnosticCenters();
  const { data: tests = [] } = useDiagnosticTests();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '100vh' }}>
      {/* 🌟 Premium Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #062438 0%, #0C4A60 50%, #093748 100%)',
          color: 'var(--white)',
          padding: '4.5rem 0 5.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow circles */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ textAlign: 'center', maxWidth: '880px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <ShieldCheck size={16} color="#38BDF8" />
            <span style={{ color: '#F0F9FF' }}>Bangladesh's Verified Healthcare & Chamber Network</span>
          </div>

          <h1
            style={{
              fontSize: '2.85rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              color: 'var(--white)',
              marginBottom: '1.25rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Healthcare Appointments, <span style={{ color: '#38BDF8' }}>Simplified.</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(241, 245, 249, 0.88)',
              lineHeight: 1.6,
              marginBottom: '2.25rem',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
            }}
          >
            Instant doctor chamber serial booking across top hospitals, diagnostic centers, and private suites. Live queue tracking with verified digital prescriptions.
          </p>

          {/* Unified Floating Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 0.55rem 0.45rem 1.25rem',
              boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '680px',
              margin: '0 auto',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.65rem' }}>
              <Search size={20} color="var(--primary-700)" />
              <input
                type="text"
                placeholder="Search doctors, specializations, hospitals, or tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.975rem',
                  color: 'var(--slate-800)',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                }}
              />
            </div>
            <Button size="md" variant="primary" type="submit" style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem', fontWeight: 700 }}>
              Search
            </Button>
          </form>

          {/* Quick Categories Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              marginTop: '1.75rem',
              flexWrap: 'wrap',
              fontSize: '0.825rem',
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>Popular:</span>
            {['Cardiologist', 'Gynecologist', 'Neurologist', 'Pediatrician', 'Orthopedic'].map((sp) => (
              <Link
                key={sp}
                to={`/doctors?specialization=${encodeURIComponent(sp)}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'var(--white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  transition: 'all 0.15s ease',
                }}
              >
                {sp}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 3 Floating Feature Cards (Overlapping Hero) */}
      <section className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10, marginBottom: '3.5rem' }}>
        <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
          <div
            className="card card-hover"
            style={{
              padding: '1.35rem 1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--primary-100)',
              }}
            >
              <Calendar size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Single Global Doctor Profile
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.55 }}>
                Physicians appear under one verified profile across Ibn Sina, Lab Aid, and private chambers. Pick the closest chamber and fee.
              </p>
            </div>
          </div>

          <div
            className="card card-hover"
            style={{
              padding: '1.35rem 1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--accent-50)',
                color: 'var(--accent-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--accent-100)',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Live Queue & Wait Estimates
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.55 }}>
                Track real-time OPD serial progress. See patients ahead, estimated wait time in minutes, and self check-in upon arrival.
              </p>
            </div>
          </div>

          <div
            className="card card-hover"
            style={{
              padding: '1.35rem 1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#F3E8FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #E9D5FF',
              }}
            >
              <FileCheck2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Authentic Digital Prescriptions
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.55 }}>
                Prescriptions carry authentic hospital or chamber letterheads with dosage instructions, and test reports are downloadable 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 1. FEATURED SPECIALISTS SECTION (Matching Modern Directory Layout) */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Stethoscope size={22} color="var(--primary-800)" />
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Featured Verified Specialists</h2>
            </div>
            <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
              Consult highly qualified specialists with active hospital OPD and private chamber schedules.
            </p>
          </div>
          <Link to="/doctors">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
              View All Specialists ({featuredDoctors.length})
            </Button>
          </Link>
        </div>

        {/* Large Doctor Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {featuredDoctors.slice(0, 2).map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--white)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Doctor Main Header */}
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
                    src={doc.photoUrl}
                    alt={doc.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-100)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/doctors/${doc.id}`} style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {doc.name}
                      </Link>
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                        BMDC Verified
                      </span>
                    </div>
                    <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.925rem', marginTop: '0.15rem' }}>
                      {doc.specialization}
                    </p>
                    <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                      {doc.qualifications.join(' • ')}
                    </p>
                  </div>
                </div>

                <Link to={`/doctors/${doc.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ChevronRight size={14} />}>
                    View Profile
                  </Button>
                </Link>
              </div>

              {/* Practice Locations Mini Grid */}
              <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
                {doc.practiceLocations.map((loc) => (
                  <div
                    key={loc.id}
                    style={{
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Building2 size={14} color="var(--primary-800)" />
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{loc.institutionName}</h4>
                        </div>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary-800)' }}>৳{loc.consultationFee}</strong>
                      </div>
                      <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                        {loc.chamberName} • {loc.city}
                      </p>
                      <div className="text-xs text-muted" style={{ marginTop: '0.35rem' }}>
                        📅 {loc.scheduleDays.slice(0, 2).join(', ')} • ⏰ {loc.startTime} - {loc.endTime}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        style={{ width: '100%', minHeight: '34px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/patient/book/${doc.id}?locId=${loc.id}`)}
                      >
                        Book Serial
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 2. PARTNER HOSPITALS & DIAGNOSTIC CENTERS SECTION */}
      <section style={{ backgroundColor: 'var(--white)', padding: '4rem 0', borderTop: '1px solid var(--slate-200)', borderBottom: '1px solid var(--slate-200)', marginBottom: '4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Building2 size={22} color="var(--primary-800)" />
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Partner Hospitals & Diagnostic Centers</h2>
              </div>
              <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                Verified institutional health hubs offering specialist chambers and clinical testing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/hospitals">
                <Button variant="outline" size="sm">Hospitals ({hospitals.length})</Button>
              </Link>
              <Link to="/diagnostic-centers">
                <Button variant="outline" size="sm">Diagnostic Centers ({diagnosticCenters.length})</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-4">
            {hospitals.concat(diagnosticCenters as any).slice(0, 3).map((inst: any) => (
              <div
                key={inst.id}
                className="card card-hover"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--slate-200)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <img
                      src={inst.logoUrl}
                      alt={inst.name}
                      style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--slate-200)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>{inst.name}</h3>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        DGHS Approved
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} color="var(--primary-700)" /> {inst.address}, {inst.city}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                    <span><strong>{inst.doctorCount || 12}</strong> Specialists</span>
                    <span><strong>{inst.totalChambers || inst.testCount || 8}</strong> Facilities</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  <Link to={inst.totalChambers ? '/hospitals' : '/diagnostic-centers'} style={{ display: 'block' }}>
                    <Button size="sm" variant="primary" style={{ width: '100%' }}>
                      Explore Facility
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 3. POPULAR DIAGNOSTIC TESTS SECTION */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FlaskConical size={22} color="var(--accent-600)" />
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Popular Diagnostic Investigations</h2>
            </div>
            <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
              Book accredited pathology lab tests with verified turnaround and digital reports.
            </p>
          </div>
          <Link to="/tests">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
              View All Tests ({tests.length})
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 md-grid-cols-2 sm-grid-cols-1 gap-3">
          {tests.slice(0, 4).map((test) => (
            <div
              key={test.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
                padding: '1.15rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--white)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    {test.category}
                  </span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary-800)' }}>
                    ৳{test.price}
                  </strong>
                </div>

                <h3 style={{ fontSize: '0.975rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--slate-900)' }}>
                  {test.name}
                </h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  🏥 {test.centerName}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.65rem' }}>
                <Link to="/tests" style={{ display: 'block' }}>
                  <Button size="sm" variant="outline" style={{ width: '100%', minHeight: '34px', fontSize: '0.8rem' }}>
                    Book Test Order
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
