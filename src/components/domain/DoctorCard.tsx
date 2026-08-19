import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Doctor } from '../../types';
import { Button, Badge } from '../ui/Core';
import { Calendar, Clock, MapPin, Building2, Stethoscope, ChevronRight } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBookLocation?: (doctorId: string, locationId: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookLocation }) => {
  const navigate = useNavigate();

  const handleBook = (locationId: string) => {
    if (onBookLocation) {
      onBookLocation(doctor.id, locationId);
    } else {
      navigate(`/patient/book/${doctor.id}?locId=${locationId}`);
    }
  };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Global Doctor Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <img
          src={doctor.photoUrl}
          alt={doctor.name}
          style={{
            width: '76px',
            height: '76px',
            borderRadius: 'var(--radius-lg)',
            objectFit: 'cover',
            border: '2px solid var(--primary-100)',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/doctors/${doctor.id}`} style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--slate-900)' }}>
              {doctor.name}
            </Link>
            {doctor.isVerified && (
              <Badge variant="accent" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {doctor.specialization}
          </p>
          <p className="text-sm text-muted" style={{ marginTop: '0.2rem' }}>
            {doctor.qualifications.join(' • ')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
            <span><strong>{doctor.experienceYears}+</strong> Years Exp.</span>
            <span>{doctor.registrationNumber}</span>
          </div>
        </div>
      </div>

      {/* Practice Locations List - Crucial Global Doctor Requirement */}
      <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available Practice Locations ({doctor.practiceLocations.length})
          </span>
          <Link to={`/doctors/${doctor.id}`} style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            Full Profile <ChevronRight size={14} />
          </Link>
        </div>

        {doctor.practiceLocations.length === 0 ? (
          <p className="text-sm text-muted">No chambers currently scheduled.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {doctor.practiceLocations.map((loc) => {
              const typeIcon =
                loc.locationType === 'hospital' ? (
                  <Building2 size={16} color="var(--primary-700)" />
                ) : loc.locationType === 'diagnostic_center' ? (
                  <Stethoscope size={16} color="var(--accent-600)" />
                ) : (
                  <MapPin size={16} color="#E11D48" />
                );

              return (
                <div
                  key={loc.id}
                  style={{
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {typeIcon}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                          {loc.institutionName}
                        </div>
                        <div className="text-xs text-muted">
                          {loc.chamberName} • {loc.address}, {loc.city}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                        ৳{loc.consultationFee}
                      </span>
                      <span className="text-xs text-muted" style={{ display: 'block' }}>Cash Only</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--slate-200)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} /> {loc.scheduleDays.slice(0, 2).join(', ')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {loc.startTime} - {loc.endTime}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleBook(loc.id)}
                    >
                      Book Serial
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
