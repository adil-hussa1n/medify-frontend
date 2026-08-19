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
  PlusCircle,
  Users,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

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

  // Purely role-tailored links (Only essential links for that role)
  const getRoleLinks = () => {
    switch (currentUser.role) {
      case 'patient':
        return [
          { label: 'Patient Dashboard', path: '/patient', icon: <Home size={16} /> },
          { label: 'Find Doctors', path: '/doctors', icon: <Search size={16} /> },
          { label: 'Diagnostic Tests', path: '/tests', icon: <Stethoscope size={16} /> },
          { label: 'My Appointments', path: '/patient/appointments', icon: <Calendar size={16} /> },
          { label: 'Prescriptions', path: '/patient/prescriptions', icon: <FileText size={16} /> },
          { label: 'Lab Reports', path: '/patient/reports', icon: <Activity size={16} /> },
        ];

      case 'doctor':
        return [
          { label: 'Doctor Portal', path: '/doctor', icon: <Home size={16} /> },
          { label: 'Issue Rx', path: '/doctor/prescriptions/new', icon: <PlusCircle size={16} /> },
          { label: 'Colleagues & Directory', path: '/doctors', icon: <Search size={16} /> },
        ];

      case 'doctor_staff':
        return [
          { label: 'Doctor Assistant Desk', path: '/doctor-staff', icon: <Home size={16} /> },
        ];

      case 'hospital':
        return [
          { label: 'Hospital Portal', path: '/hospital', icon: <Building2 size={16} /> },
        ];

      case 'hospital_staff':
        return [
          { label: 'Hospital Front Desk', path: '/hospital-staff', icon: <Building2 size={16} /> },
        ];

      case 'diagnostic':
        return [
          { label: 'Diagnostic Portal', path: '/diagnostic', icon: <Stethoscope size={16} /> },
        ];

      case 'diagnostic_staff':
        return [
          { label: 'Diagnostic Lab Desk', path: '/diagnostic-staff', icon: <Stethoscope size={16} /> },
        ];

      case 'admin':
        return [
          { label: 'Super Admin Hub', path: '/admin', icon: <Shield size={16} /> },
          { label: 'Doctors', path: '/doctors', icon: <Users size={16} /> },
          { label: 'Hospitals', path: '/hospitals', icon: <Building2 size={16} /> },
          { label: 'Diagnostic Centers', path: '/diagnostic-centers', icon: <Stethoscope size={16} /> },
        ];

      default:
        return [
          { label: 'Home', path: '/', icon: <Home size={16} /> },
          { label: 'Doctors', path: '/doctors', icon: <Search size={16} /> },
          { label: 'Tests', path: '/tests', icon: <Stethoscope size={16} /> },
        ];
    }
  };

  const roleLinks = getRoleLinks();

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
          {/* Left: Brand Logo & Mobile Menu Hamburger */}
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

          {/* Desktop Navigation Links (Strictly role-relevant) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
            {roleLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    color: isActive ? 'var(--primary-800)' : 'var(--slate-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/profile"
              style={{
                fontWeight: location.pathname === '/profile' ? 700 : 500,
                fontSize: '0.875rem',
                color: location.pathname === '/profile' ? 'var(--primary-800)' : 'var(--slate-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <User size={15} color="var(--primary-700)" />
              <span>Profile</span>
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
                  gap: '0.35rem',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-800)',
                  border: '1px solid var(--primary-200)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
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
                    width: '250px',
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
                    Switch Persona Role
                  </div>
                  {(
                    [
                      'patient',
                      'doctor',
                      'hospital',
                      'diagnostic',
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
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
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

                  {/* Task-Based Staff Switcher Options */}
                  <div
                    style={{
                      padding: '0.45rem 0.5rem 0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--primary-800)',
                      textTransform: 'uppercase',
                      borderTop: '1px solid var(--slate-100)',
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Users size={12} />
                    <span>Switch Staff by Assigned Task</span>
                  </div>

                  {/* 1. Doctor Chamber Staff Tasks */}
                  <div style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)' }}>
                    Doctor Assistants
                  </div>
                  <button
                    onClick={() => {
                      // Switch to Chamber 204 Assistant
                      switchRole('doctor_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/doctor-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: currentUser.role === 'doctor_staff' ? 'var(--primary-800)' : 'var(--slate-700)',
                      fontWeight: currentUser.role === 'doctor_staff' ? 700 : 500,
                      backgroundColor: currentUser.role === 'doctor_staff' ? 'var(--primary-50)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🩺 Dr. Rahman — Chamber 204</span>
                    {currentUser.role === 'doctor_staff' && <CheckCircle size={13} color="var(--primary-800)" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('doctor_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/doctor-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--slate-700)',
                      fontWeight: 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🩺 Dr. Rahman — Private Chamber</span>
                  </button>

                  {/* 2. Hospital Staff Tasks */}
                  <div style={{ padding: '0.3rem 0.5rem 0.1rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)' }}>
                    Hospital Staff Tasks
                  </div>
                  <button
                    onClick={() => {
                      switchRole('hospital_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/hospital-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: currentUser.role === 'hospital_staff' ? 'var(--primary-800)' : 'var(--slate-700)',
                      fontWeight: currentUser.role === 'hospital_staff' ? 700 : 500,
                      backgroundColor: currentUser.role === 'hospital_staff' ? 'var(--primary-50)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🏥 Ibn Sina — Doctor Chambers Desk</span>
                    {currentUser.role === 'hospital_staff' && <CheckCircle size={13} color="var(--primary-800)" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('hospital_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/hospital-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--slate-700)',
                      fontWeight: 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🏥 Ibn Sina — Lab & Tests Desk</span>
                  </button>

                  {/* 3. Diagnostic Staff Tasks */}
                  <div style={{ padding: '0.3rem 0.5rem 0.1rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)' }}>
                    Diagnostic Center Tasks
                  </div>
                  <button
                    onClick={() => {
                      switchRole('diagnostic_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/diagnostic-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: currentUser.role === 'diagnostic_staff' ? 'var(--accent-700)' : 'var(--slate-700)',
                      fontWeight: currentUser.role === 'diagnostic_staff' ? 700 : 500,
                      backgroundColor: currentUser.role === 'diagnostic_staff' ? 'var(--accent-50)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🧪 Lab Aid — Pathology Lab Tech</span>
                    {currentUser.role === 'diagnostic_staff' && <CheckCircle size={13} color="var(--accent-700)" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('diagnostic_staff');
                      setRoleSwitcherOpen(false);
                      navigate('/diagnostic-staff');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--slate-700)',
                      fontWeight: 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>🧪 Lab Aid — Visiting Doctor Chamber Desk</span>
                  </button>

                  <div
                    style={{
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--slate-400)',
                      textTransform: 'uppercase',
                      borderTop: '1px solid var(--slate-100)',
                      marginTop: '0.35rem',
                    }}
                  >
                    Account
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setRoleSwitcherOpen(false)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: 'var(--primary-800)',
                      fontWeight: 700,
                      backgroundColor: 'var(--primary-50)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <User size={15} />
                    <span>My Profile & Settings</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Role-Tailored Mobile Slide Drawer */}
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
                {roleLabels[currentUser.role]} Menu
              </div>

              {/* Dynamic Role Navigation Items in Drawer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {roleLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: isActive ? 'var(--primary-800)' : 'var(--slate-800)',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: location.pathname === '/profile' ? 'var(--primary-800)' : 'var(--slate-800)',
                    fontWeight: location.pathname === '/profile' ? 700 : 500,
                    backgroundColor: location.pathname === '/profile' ? 'var(--primary-50)' : 'transparent',
                  }}
                >
                  <User size={16} />
                  <span>My Profile & Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const PatientMobileNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Strict Role-Tailored Mobile Bottom Nav Items (Zero Unnecessary Links)
  const getNavItemsByRole = () => {
    switch (currentUser.role) {
      case 'patient':
        return [
          { label: 'Home', path: '/', icon: <Home size={18} /> },
          { label: 'Doctors', path: '/doctors', icon: <Search size={18} /> },
          { label: 'Tests', path: '/tests', icon: <Stethoscope size={18} /> },
          { label: 'Serials', path: '/patient/appointments', icon: <Calendar size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'doctor':
        return [
          { label: 'Portal', path: '/doctor', icon: <Activity size={18} /> },
          { label: 'Issue Rx', path: '/doctor/prescriptions/new', icon: <PlusCircle size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'doctor_staff':
        return [
          { label: 'Assistant Desk', path: '/doctor-staff', icon: <Activity size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'hospital':
        return [
          { label: 'Hospital Hub', path: '/hospital', icon: <Building2 size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'hospital_staff':
        return [
          { label: 'Front Desk', path: '/hospital-staff', icon: <Building2 size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'diagnostic':
        return [
          { label: 'Diagnostic Hub', path: '/diagnostic', icon: <Stethoscope size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'diagnostic_staff':
        return [
          { label: 'Lab Desk', path: '/diagnostic-staff', icon: <Stethoscope size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      case 'admin':
        return [
          { label: 'Super Admin Hub', path: '/admin', icon: <Shield size={18} /> },
          { label: 'Doctors', path: '/doctors', icon: <Search size={18} /> },
          { label: 'Hospitals', path: '/hospitals', icon: <Building2 size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];

      default:
        return [
          { label: 'Home', path: '/', icon: <Home size={18} /> },
          { label: 'Doctors', path: '/doctors', icon: <Search size={18} /> },
          { label: 'Profile', path: '/profile', icon: <User size={18} /> },
        ];
    }
  };

  const items = getNavItemsByRole();

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
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
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
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-800)' : 'var(--slate-500)',
              flex: 1,
              padding: '0.25rem 0',
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
