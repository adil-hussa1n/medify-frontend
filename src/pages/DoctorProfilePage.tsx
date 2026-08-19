import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDoctor } from '../hooks/useHealthcare';
import { Button, Badge } from '../components/ui/Core';
import { Building2, Stethoscope, MapPin, Calendar, Clock, Award, ShieldCheck, ChevronLeft } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, isLoading } = useDoctor(id);
  const navigate = useNavigate();

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
        <Link to="/doctors">
          <Button variant="primary" style={{ marginTop: '1rem' }}>
            Back to Doctors List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1000px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)', marginBottom: '1.5rem', fontWeight: 500 }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Global Doctor Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            style={{
              width: '130px',
              height: '130px',
              borderRadius: 'var(--radius-xl)',
              objectFit: 'cover',
              border: '3px solid var(--primary-100)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctor.name}</h1>
              {doctor.isVerified && (
                <Badge variant="accent">
                  <ShieldCheck size={14} /> Verified Doctor
                </Badge>
              )}
            </div>
            <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>
              {doctor.specialization}
            </p>
            <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
              {doctor.qualifications.join(' • ')}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span className="text-xs text-muted" style={{ display: 'block' }}>Experience</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{doctor.experienceYears}+ Years</strong>
              </div>
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span className="text-xs text-muted" style={{ display: 'block' }}>BMDC Registration</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{doctor.registrationNumber}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span className="text-xs text-muted" style={{ display: 'block' }}>Global Identity ID</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary-800)' }}>{doctor.id}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Bio */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-100)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>About the Doctor</h3>
          <p style={{ color: 'var(--slate-700)', lineHeight: 1.6 }}>{doctor.about}</p>
        </div>
      </div>

      {/* Practice Locations & Booking Section */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Practice Locations & Chambers
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Choose your preferred hospital or clinic to book your serial number.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {doctor.practiceLocations.map((loc) => {
            const isHosp = loc.locationType === 'hospital';
            const isDiag = loc.locationType === 'diagnostic_center';

            return (
              <div
                key={loc.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isHosp ? 'var(--primary-50)' : isDiag ? 'var(--accent-50)' : 'var(--slate-100)',
                      color: isHosp ? 'var(--primary-800)' : isDiag ? 'var(--accent-600)' : 'var(--slate-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isHosp ? <Building2 size={24} /> : isDiag ? <Stethoscope size={24} /> : <MapPin size={24} />}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{loc.institutionName}</h3>
                    <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.15rem' }}>
                      {loc.chamberName}
                    </p>
                    <p className="text-sm text-muted" style={{ marginTop: '0.2rem' }}>
                      {loc.address}, {loc.city} • Tel: {loc.phone}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={15} color="var(--primary-700)" /> {loc.scheduleDays.join(', ')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={15} color="var(--primary-700)" /> {loc.startTime} - {loc.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    ৳{loc.consultationFee}
                  </div>
                  <div className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>Consultation Fee (Cash Only)</div>
                  <Link to={`/patient/book/${doctor.id}?locId=${loc.id}`}>
                    <Button variant="primary" size="md">
                      Book Serial
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
