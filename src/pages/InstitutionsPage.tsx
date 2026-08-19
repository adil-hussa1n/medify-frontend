import React from 'react';
import { useHospitals, useDiagnosticCenters } from '../hooks/useHealthcare';
import { Button, Badge } from '../components/ui/Core';
import { Building2, Stethoscope, MapPin, Phone, Globe, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstitutionsPage: React.FC<{ type: 'hospital' | 'diagnostic' }> = ({ type }) => {
  const { data: hospitals = [] } = useHospitals();
  const { data: diagnosticCenters = [] } = useDiagnosticCenters();

  const isHospital = type === 'hospital';
  const list = isHospital ? hospitals : diagnosticCenters;

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          {isHospital ? 'Partner Hospitals' : 'Diagnostic Centers'}
        </h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          {isHospital
            ? 'Find verified partner hospitals with multidisciplinary consultation chambers and outpatient clinics.'
            : 'Find diagnostic testing centers offering walk-in pathology and home sample collection.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
        {list.map((item: any) => (
          <div key={item.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <img
                src={item.logoUrl}
                alt={item.name}
                style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.name}</h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  {item.registrationNumber}
                </p>
                <p className="text-sm" style={{ color: 'var(--slate-600)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> {item.address}, {item.city}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-xs text-muted">
                📞 {item.phone}
              </span>
              <Link to={isHospital ? `/doctors?search=${encodeURIComponent(item.name)}` : `/tests?centerId=${item.id}`}>
                <Button size="sm" variant="primary" rightIcon={<ChevronRight size={14} />}>
                  {isHospital ? 'View Doctors' : 'View Tests'}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
