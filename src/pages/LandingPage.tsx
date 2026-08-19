import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDoctors, useHospitals, useDiagnosticCenters, useDiagnosticTests } from '../hooks/useHealthcare';
import { DoctorCard } from '../components/domain/DoctorCard';
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
    <div>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--primary-900)',
          color: 'var(--white)',
          padding: '3.5rem 0 4rem',
          backgroundImage: 'radial-gradient(circle at top right, rgba(14, 116, 144, 0.35), transparent 60%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <ShieldCheck size={16} color="var(--accent-500)" />
            <span>Verified Healthcare Ecosystem</span>
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: 'var(--white)',
              marginBottom: '1rem',
            }}
          >
            Healthcare, Simplified.
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--slate-300)',
              lineHeight: 1.5,
              marginBottom: '2rem',
            }}
          >
            Instantly book serial appointments with verified specialists across hospitals, diagnostic centers, and private chambers. Track live queues and access authentic digital prescriptions.
          </p>

          {/* Unified Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-xl)',
              padding: '0.4rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 0.75rem', gap: '0.5rem' }}>
              <Search size={18} color="var(--slate-400)" />
              <input
                type="text"
                placeholder="Search doctors, specializations, hospitals, or tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--slate-800)',
                }}
              />
            </div>
            <Button size="md" variant="primary" type="submit">
              Search
            </Button>
          </form>

          {/* Quick Categories */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
              fontSize: '0.8125rem',
              color: 'var(--slate-300)',
            }}
          >
            <span>Popular:</span>
            {['Cardiologist', 'Gynecologist', 'Neurologist', 'Pediatrician', 'Orthopedic'].map((sp) => (
              <Link
                key={sp}
                to={`/doctors?specialization=${encodeURIComponent(sp)}`}
                style={{
                  color: 'var(--white)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                {sp}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container" style={{ padding: '3rem 1rem' }}>
        <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
          <div className="card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                Single Global Doctor Identity
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Doctors appear as one profile across Ibn Sina, Lab Aid, and private chambers. Pick the most convenient location and fee.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-50)',
                color: 'var(--accent-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                Live Queue & Wait Estimates
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Real-time serial tracking. See patients ahead, estimated wait time in minutes, and self check-in upon arrival.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-100)',
                color: 'var(--slate-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCheck2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                Branded Prescriptions & Reports
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Prescriptions carry authentic hospital or chamber headers with full medication details, and pathology test reports are downloadable 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. FEATURED DOCTORS SECTION */}
      <section style={{ backgroundColor: 'var(--slate-100)', padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Featured Verified Specialists</h2>
              <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                Consult highly qualified doctors with established hospital and chamber affiliations.
              </p>
            </div>
            <Link to="/doctors">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
                View All Doctors ({featuredDoctors.length})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {featuredDoctors.slice(0, 2).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED HOSPITALS SECTION */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={22} color="var(--primary-800)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Partner Hospitals</h2>
              </div>
              <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                Multidisciplinary healthcare facilities with OPD consultation chambers and verified doctors.
              </p>
            </div>
            <Link to="/hospitals">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
                View All Hospitals ({hospitals.length})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
            {hospitals.slice(0, 3).map((hosp) => (
              <div key={hosp.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <img
                      src={hosp.logoUrl}
                      alt={hosp.name}
                      style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{hosp.name}</h3>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        DGHS Approved
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> {hosp.address}, {hosp.city}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                    <span><strong>{hosp.totalChambers}</strong> Chambers</span>
                    <span><strong>{hosp.doctorCount}</strong> Doctors</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  <Link to={`/doctors?search=${encodeURIComponent(hosp.name)}`} style={{ display: 'block' }}>
                    <Button size="sm" variant="primary" style={{ width: '100%' }}>
                      View Available Doctors
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED DIAGNOSTIC CENTERS SECTION */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', borderBottom: '1px solid var(--slate-200)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={22} color="var(--accent-600)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Partner Diagnostic Centers</h2>
              </div>
              <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                Certified pathology laboratories offering walk-in tests and home sample collection.
              </p>
            </div>
            <Link to="/diagnostic-centers">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
                View All Centers ({diagnosticCenters.length})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
            {diagnosticCenters.slice(0, 3).map((center) => (
              <div key={center.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <img
                      src={center.logoUrl}
                      alt={center.name}
                      style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{center.name}</h3>
                      {center.offersHomeCollection && (
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          <Home size={11} /> Home Collection
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> {center.address}, {center.city}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                    <span><strong>{center.testCount}</strong> Tests Available</span>
                    <span><strong>{center.doctorCount}</strong> Specialists</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  <Link to={`/tests?centerId=${center.id}`} style={{ display: 'block' }}>
                    <Button size="sm" variant="primary" style={{ width: '100%' }}>
                      View Available Tests
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED POPULAR DIAGNOSTIC TESTS SECTION */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Popular Diagnostic Tests</h2>
              <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                Transparent pricing, clear preparation instructions, and verified reports.
              </p>
            </div>
            <Link to="/tests">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight size={15} />}>
                View All Tests ({tests.length})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-2 gap-3">
            {tests.slice(0, 4).map((test) => (
              <div
                key={test.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '1rem',
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

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--slate-900)' }}>
                    {test.name}
                  </h3>
                  <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                    🏥 {test.centerName}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.65rem' }}>
                  <Link to="/tests" style={{ display: 'block' }}>
                    <Button size="sm" variant="outline" style={{ width: '100%', minHeight: '34px', fontSize: '0.8rem' }}>
                      Book Test
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
