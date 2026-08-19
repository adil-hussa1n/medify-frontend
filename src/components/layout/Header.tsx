import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Activity,
  Calendar,
  FileText,
  Search,
  User,
  Building2,
  Stethoscope,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Home,
  CheckCircle,
  Shield,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return '/patient';
      case 'doctor':
        return '/doctor';
      case 'doctor_staff':
        return '/doctor-staff';
      case 'hospital':
        return '/hospital';
      case 'hospital_staff':
        return '/hospital-staff';
      case 'diagnostic':
        return '/diagnostic';
      case 'diagnostic_staff':
        return '/diagnostic-staff';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const roleLabels: Record<UserRole, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    doctor_staff: 'Doctor Staff',
    hospital: 'Hospital Admin',
    hospital_staff: 'Hospital Staff',
    diagnostic: 'Diagnostic Admin',
    diagnostic_staff: 'Diagnostic Staff',
    admin: 'Super Admin',
  };

  return (
    <>
      <header
        style={{
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--slate-200)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            gap: '1rem',
          }}
        >
          {/* Left: Brand Logo & Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-hamburger-btn"
              aria-label="Open Navigation Menu"
              style={{
                display: 'none',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--slate-700)',
              }}
            >
              <Menu size={22} />
            </button>

            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-800)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Activity size={20} />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <span
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--slate-900)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  MEDIFY<span style={{ color: 'var(--accent-600)' }}>247</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links & Explore Dropdown */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
            {/* Direct Dashboard Link according to Role */}
            <Link
              to={getDashboardPath(currentUser.role)}
              style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: location.pathname === getDashboardPath(currentUser.role) ? 'var(--primary-800)' : 'var(--slate-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Home size={16} color="var(--primary-700)" />
              <span>Dashboard</span>
            </Link>

            {/* Explore Services Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setExploreDropdownOpen(true)}
              onMouseLeave={() => setExploreDropdownOpen(false)}
            >
              <button
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color:
                    location.pathname.startsWith('/doctors') ||
                    location.pathname.startsWith('/hospitals') ||
                    location.pathname.startsWith('/diagnostic-centers') ||
                    location.pathname.startsWith('/tests')
                      ? 'var(--primary-800)'
                      : 'var(--slate-700)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: exploreDropdownOpen ? 'var(--slate-100)' : 'transparent',
                }}
              >
                <span>Find & Explore</span>
                <ChevronDown size={15} />
              </button>

              {exploreDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    width: '260px',
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--slate-200)',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}
                >
                  <Link
                    to="/doctors"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-800)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    className="dropdown-item"
                  >
                    <Search size={16} color="var(--primary-700)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Find Doctors</div>
                      <div className="text-xs text-muted">Specialists & Chambers</div>
                    </div>
                  </Link>

                  <Link
                    to="/hospitals"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-800)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    className="dropdown-item"
                  >
                    <Building2 size={16} color="var(--primary-700)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Hospitals</div>
                      <div className="text-xs text-muted">Partner Clinics & OPDs</div>
                    </div>
                  </Link>

                  <Link
                    to="/diagnostic-centers"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-800)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    className="dropdown-item"
                  >
                    <Stethoscope size={16} color="var(--accent-600)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Diagnostic Centers</div>
                      <div className="text-xs text-muted">Testing Laboratories</div>
                    </div>
                  </Link>

                  <Link
                    to="/tests"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-800)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    className="dropdown-item"
                  >
                    <FileText size={16} color="var(--accent-600)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Diagnostic Tests</div>
                      <div className="text-xs text-muted">Individual Pathology Tests</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Quick Links */}
            <Link
              to="/doctors"
              style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: location.pathname.startsWith('/doctors') ? 'var(--primary-800)' : 'var(--slate-600)',
              }}
            >
              Doctors
            </Link>
            <Link
              to="/tests"
              style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: location.pathname.startsWith('/tests') ? 'var(--primary-800)' : 'var(--slate-600)',
              }}
            >
              Tests
            </Link>
          </nav>

          {/* Right Section: Role Switcher Persona Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-800)',
                  border: '1px solid var(--primary-200)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={14} color="var(--accent-600)" />
                <span>Role: {roleLabels[currentUser.role]}</span>
                <ChevronDown size={14} />
              </button>

              {roleSwitcherOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '260px',
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--slate-200)',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--slate-400)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Switch User Role Persona
                  </div>
                  {(
                    [
                      'patient',
                      'doctor',
                      'doctor_staff',
                      'hospital',
                      'hospital_staff',
                      'diagnostic',
                      'diagnostic_staff',
                      'admin',
                    ] as UserRole[]
                  ).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setRoleSwitcherOpen(false);
                        navigate(getDashboardPath(role));
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: currentUser.role === role ? 'var(--primary-800)' : 'var(--slate-700)',
                        fontWeight: currentUser.role === role ? 700 : 400,
                        backgroundColor: currentUser.role === role ? 'var(--primary-50)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{roleLabels[role]}</span>
                      {currentUser.role === role && <CheckCircle size={15} color="var(--primary-800)" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="modal-overlay"
          style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '300px',
              height: '100vh',
              backgroundColor: 'var(--white)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInLeft 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--slate-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-800)" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>MEDIFY247</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--slate-500)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--slate-400)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Explore & Find
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Link
                  to="/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--slate-800)',
                    fontWeight: 500,
                  }}
                >
                  <Search size={18} color="var(--primary-700)" />
                  <span>Find Doctors</span>
                </Link>

                <Link
                  to="/hospitals"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--slate-800)',
                    fontWeight: 500,
                  }}
                >
                  <Building2 size={18} color="var(--primary-700)" />
                  <span>Hospitals</span>
                </Link>

                <Link
                  to="/diagnostic-centers"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--slate-800)',
                    fontWeight: 500,
                  }}
                >
                  <Stethoscope size={18} color="var(--accent-600)" />
                  <span>Diagnostic Centers</span>
                </Link>

                <Link
                  to="/tests"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--slate-800)',
                    fontWeight: 500,
                  }}
                >
                  <FileText size={18} color="var(--accent-600)" />
                  <span>Diagnostic Tests</span>
                </Link>
              </div>

              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--slate-400)',
                  textTransform: 'uppercase',
                  marginTop: '1.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                Active Role Portal
              </div>
              <Link
                to={getDashboardPath(currentUser.role)}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-800)',
                  color: 'var(--white)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <User size={18} />
                <span>{roleLabels[currentUser.role]} Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const PatientMobileNav: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/', icon: <Home size={18} /> },
    { label: 'Doctors', path: '/doctors', icon: <Search size={18} /> },
    { label: 'Tests', path: '/tests', icon: <Stethoscope size={18} /> },
    { label: 'Appointments', path: '/patient/appointments', icon: <Calendar size={18} /> },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: <FileText size={18} /> },
  ];

  return (
    <div
      className="mobile-only-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--slate-200)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom))',
        zIndex: 90,
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/patient' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              fontSize: '0.65rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-800)' : 'var(--slate-500)',
              flex: 1,
              padding: '0.2rem 0',
            }}
          >
            <div style={{ color: isActive ? 'var(--primary-800)' : 'var(--slate-400)' }}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
