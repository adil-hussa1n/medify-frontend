import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDoctors } from '../hooks/useHealthcare';
import { DoctorCard } from '../components/domain/DoctorCard';
import { Search, Stethoscope, SlidersHorizontal } from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSpec = searchParams.get('specialization') || '';

  const [search, setSearch] = useState(initialSearch);
  const [specialization, setSpecialization] = useState(initialSpec);
  const [locationFilter, setLocationFilter] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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

  return (
    <div className="container page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Find Doctors & Specialists</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Search specialists across hospitals, diagnostic centers, and private chambers.
        </p>
      </div>

      {/* Mobile Search & Filter Toggle Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="var(--slate-400)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search doctor, hospital, or chamber..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Controls (Collapsible on mobile or active) */}
        <div
          style={{
            display: showFiltersMobile ? 'grid' : 'none',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--slate-100)',
          }}
        >
          <div>
            <label className="form-label text-xs">Specialization</label>
            <select
              className="form-select"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value === 'All Specializations' ? '' : e.target.value)}
            >
              {specializations.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Area / City</label>
            <select
              className="form-select"
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
          </div>
        </div>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '240px' }} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Stethoscope size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            No Doctors Found
          </h3>
          <p className="text-sm text-muted" style={{ maxWidth: '400px', marginTop: '0.5rem' }}>
            We couldn't find any doctor matching your search filters. Try clearing your filters or searching for a different keyword.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--slate-600)', fontWeight: 500 }}>
            Showing <strong>{doctors.length}</strong> verified specialist{doctors.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
