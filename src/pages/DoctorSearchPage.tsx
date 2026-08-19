import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDoctors } from '../hooks/useHealthcare';
import { Button, Badge } from '../components/ui/Core';
import {
  Search,
  Stethoscope,
  SlidersHorizontal,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  User,
  ShieldCheck,
  Star,
  Sparkles,
  Phone,
  RotateCcw,
} from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSpec = searchParams.get('specialization') || '';
  const navigate = useNavigate();

  const [search, setSearch] = useState(initialSearch);
  const [specialization, setSpecialization] = useState(initialSpec);
  const [locationFilter, setLocationFilter] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all'); // all, Cardiologist, Gynecologist, etc.

  const { data: doctors = [], isLoading } = useDoctors({
    search: search || undefined,
    specialization: specialization || undefined,
    location: locationFilter || undefined,
  });

  const specializations = [
    'All Specializations',
    'Cardiologist',
    'Gynecologist & Obstetrician',
    'Neurologist',
    'Pediatrician & Child Specialist',
    'Orthopedic & Spine Surgeon',
    'General Physician',
  ];

  const handleReset = () => {
    setSearch('');
    setSpecialization('');
    setLocationFilter('');
    setActiveTab('all');
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1160px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Find Doctors & Specialists</h1>
          <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
            Book OPD chamber serials with verified specialist physicians across partner hospitals, diagnostic centers, and private chambers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            <User size={13} /> {doctors.length} Verified Doctors
          </span>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            <ShieldCheck size={13} /> BMDC Verified
          </span>
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={18}
              color="var(--slate-400)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search doctor, hospital, or chamber..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              className="form-select"
              style={{ fontSize: '0.875rem' }}
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value === 'All Specializations' ? '' : e.target.value);
                setActiveTab(e.target.value === 'All Specializations' ? 'all' : e.target.value);
              }}
            >
              {specializations.map((sp) => (
                <option key={sp} value={sp === 'All Specializations' ? '' : sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* Area / City Filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className="form-select"
              style={{ fontSize: '0.875rem', flex: 1 }}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Dhanmondi">Dhanmondi, Dhaka</option>
              <option value="Panthapath">Panthapath, Dhaka</option>
              <option value="Uttara">Uttara, Dhaka</option>
              <option value="Gulshan">Gulshan / Banani</option>
              <option value="Bashundhara">Bashundhara R/A</option>
            </select>

            {(search || specialization || locationFilter) && (
              <Button variant="outline" size="sm" onClick={handleReset} title="Reset filters">
                <RotateCcw size={15} />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
          {['All Specializations', 'Cardiologist', 'Gynecologist & Obstetrician', 'Neurologist', 'Pediatrician & Child Specialist', 'Orthopedic & Spine Surgeon'].map((cat) => {
            const isCatActive = (cat === 'All Specializations' && !specialization) || specialization === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSpecialization(cat === 'All Specializations' ? '' : cat);
                  setActiveTab(cat === 'All Specializations' ? 'all' : cat);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  border: isCatActive ? '1px solid var(--primary-700)' : '1px solid var(--slate-200)',
                  backgroundColor: isCatActive ? 'var(--primary-50)' : 'var(--white)',
                  color: isCatActive ? 'var(--primary-800)' : 'var(--slate-600)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)', fontWeight: 500 }}>
          Showing <strong>{doctors.length}</strong> verified specialist{doctors.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Doctors Directory List: Full-Page Coverage Large Cards matching InstitutionsPage */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Stethoscope size={36} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            No Doctors Found
          </h3>
          <p className="text-sm text-muted" style={{ maxWidth: '420px', margin: '0.5rem auto 1.25rem' }}>
            We couldn't find any specialist physician matching your search criteria. Try clearing your filters or searching a different term.
          </p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {doctors.map((doc) => (
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
              {/* Doctor Main Profile Header */}
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
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-100)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/doctors/${doc.id}`}
                        style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}
                      >
                        {doc.name}
                      </Link>
                      {doc.isVerified && (
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          Verified Specialist
                        </span>
                      )}
                    </div>

                    <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.15rem' }}>
                      {doc.specialization}
                    </p>

                    <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                      {doc.qualifications.join(' • ')}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      <span><strong>{doc.experienceYears}+</strong> Years Experience</span>
                      <span>{doc.registrationNumber}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                    <Building2 size={13} /> {doc.practiceLocations.length} Available Chambers
                  </span>
                  <Link to={`/doctors/${doc.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight size={14} />}>
                      View Doctor Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Practice Locations & Booking Grid: 3-column responsive grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Consultation Chambers & Direct Serial Booking
                  </span>
                </div>

                <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
                  {doc.practiceLocations.map((loc) => {
                    const isHosp = loc.locationType === 'hospital';
                    const isDiag = loc.locationType === 'diagnostic_center';

                    return (
                      <div
                        key={loc.id}
                        style={{
                          backgroundColor: 'var(--slate-50)',
                          border: '1px solid var(--slate-200)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isHosp ? (
                                <Building2 size={15} color="var(--primary-800)" />
                              ) : isDiag ? (
                                <Stethoscope size={15} color="var(--accent-600)" />
                              ) : (
                                <MapPin size={15} color="#E11D48" />
                              )}
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                                {loc.institutionName}
                              </h4>
                            </div>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--primary-800)', whiteSpace: 'nowrap' }}>
                              ৳{loc.consultationFee}
                            </strong>
                          </div>

                          <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                            {loc.chamberName} • {loc.address}, {loc.city}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem', fontSize: '0.775rem', color: 'var(--slate-600)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={13} /> {loc.scheduleDays.join(', ')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={13} /> {loc.startTime} - {loc.endTime}
                            </span>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.65rem' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/patient/book/${doc.id}?locId=${loc.id}`)}
                          >
                            Book Serial
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
