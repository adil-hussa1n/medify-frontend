import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Core';
import { User, Mail, Phone, MapPin, Award, CheckCircle2, Building2, Stethoscope, Shield, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

  // Form State initialized with currentUser data
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address || 'Dhanmondi, Dhaka, Bangladesh');

  // Role-Specific Profile Fields
  const [specialization, setSpecialization] = useState('Senior Consultant Cardiologist');
  const [qualifications, setQualifications] = useState('MBBS (DMC), FCPS (Medicine), MD (Cardiology)');
  const [regNumber, setRegNumber] = useState('BMDC Reg #A-34982');
  const [institutionName, setInstitutionName] = useState('Lab Aid Diagnostic & Specialized Hospital');
  const [bio, setBio] = useState('Experienced specialist dedicated to compassionate, evidence-based healthcare practice.');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Update active user state
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.address = address;

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'patient':
        return <span className="badge badge-primary">Verified Patient</span>;
      case 'doctor':
        return <span className="badge badge-success">Verified Medical Doctor</span>;
      case 'hospital':
        return <span className="badge badge-accent">Hospital Administrator</span>;
      case 'diagnostic':
        return <span className="badge badge-accent">Diagnostic Center Admin</span>;
      case 'doctor_staff':
        return <span className="badge badge-slate">Doctor Assistant</span>;
      case 'hospital_staff':
        return <span className="badge badge-slate">Hospital Front Desk</span>;
      case 'diagnostic_staff':
        return <span className="badge badge-slate">Diagnostic Receptionist</span>;
      case 'admin':
        return <span className="badge badge-danger">Super Administrator</span>;
      default:
        return <span className="badge badge-slate">{currentUser.role}</span>;
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '780px' }}>
      {/* Profile Top Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          My Account & Profile
        </h1>
        <p className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
          Manage your personal details, credentials, and role settings.
        </p>
      </div>

      {isSaved && (
        <div
          style={{
            backgroundColor: 'var(--success-50)',
            border: '1px solid #BBF7D0',
            color: 'var(--success-600)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Avatar & Role Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: '1px solid var(--slate-100)',
              paddingBottom: '1.25rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-800)',
                color: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {name.charAt(0)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{name}</h2>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                User ID: {currentUser.id} • Registered via Medify247
              </p>
            </div>
          </div>

          {/* General Information Section */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--primary-900)' }}>
            1. Basic Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Address / City</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Role-Specific Editable Attributes */}
          {currentUser.role === 'doctor' && (
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--primary-900)' }}>
                2. Professional Credentials & Practice Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Medical Registration (BMDC)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label className="form-label">Degrees & Qualifications</label>
                  <input
                    type="text"
                    className="form-input"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label className="form-label">Doctor Bio / Consultation Summary</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {(currentUser.role === 'hospital' || currentUser.role === 'diagnostic') && (
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--primary-900)' }}>
                2. Institution Operational Settings
              </h3>
              <div className="form-group">
                <label className="form-label">Facility / Diagnostic Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <Button type="submit" variant="primary" size="md" leftIcon={<Save size={16} />}>
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
