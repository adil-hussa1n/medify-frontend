import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, PatientMobileNav } from './components/layout/Header';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { DoctorSearchPage } from './pages/DoctorSearchPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { DiagnosticTestsPage } from './pages/DiagnosticTestsPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { AppointmentBookingPage } from './pages/AppointmentBookingPage';

// Patient Portal
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { PatientAppointmentsPage } from './pages/PatientAppointmentsPage';
import { AppointmentDetailsPage } from './pages/AppointmentDetailsPage';
import { PatientPrescriptionsPage } from './pages/PatientPrescriptionsPage';
import { PatientReportsPage } from './pages/PatientReportsPage';
import { ProfilePage } from './pages/ProfilePage';

// Doctor Portal
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { PrescriptionCreatePage } from './pages/PrescriptionCreatePage';

// Hospital & Diagnostic Portals
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { DiagnosticDashboardPage } from './pages/DiagnosticDashboardPage';

// Staff & Admin Portals
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { SuperAdminDashboardPage } from './pages/SuperAdminDashboardPage';

// CSS Design System Imports
import './styles/variables.css';
import './styles/components.css';
import './styles/header.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 mins
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/doctors" element={<DoctorSearchPage />} />
                <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                <Route path="/hospitals" element={<InstitutionsPage type="hospital" />} />
                <Route path="/diagnostic-centers" element={<InstitutionsPage type="diagnostic" />} />
                <Route path="/tests" element={<DiagnosticTestsPage />} />

                {/* Patient Routes */}
                <Route path="/patient" element={<PatientDashboardPage />} />
                <Route path="/patient/doctors" element={<DoctorSearchPage />} />
                <Route path="/patient/book/:doctorId" element={<AppointmentBookingPage />} />
                <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
                <Route path="/patient/appointments/:id" element={<AppointmentDetailsPage />} />
                <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
                <Route path="/patient/prescriptions/:id" element={<PatientPrescriptionsPage />} />
                <Route path="/patient/reports" element={<PatientReportsPage />} />
                <Route path="/patient/reports/:id" element={<PatientReportsPage />} />
                <Route path="/patient/profile" element={<ProfilePage />} />

                {/* Doctor Routes */}
                <Route path="/doctor" element={<DoctorDashboardPage />} />
                <Route path="/doctor/appointments" element={<DoctorDashboardPage />} />
                <Route path="/doctor/prescriptions" element={<DoctorDashboardPage />} />
                <Route path="/doctor/prescriptions/new" element={<PrescriptionCreatePage />} />

                {/* Doctor Staff Routes */}
                <Route path="/doctor-staff" element={<StaffDashboardPage staffType="doctor_staff" />} />
                <Route path="/doctor-staff/appointments" element={<StaffDashboardPage staffType="doctor_staff" />} />

                {/* Hospital Routes */}
                <Route path="/hospital" element={<HospitalDashboardPage />} />
                <Route path="/hospital/appointments" element={<HospitalDashboardPage />} />
                <Route path="/hospital-staff" element={<StaffDashboardPage staffType="hospital_staff" />} />

                {/* Diagnostic Center Routes */}
                <Route path="/diagnostic" element={<DiagnosticDashboardPage />} />
                <Route path="/diagnostic/orders" element={<DiagnosticDashboardPage />} />
                <Route path="/diagnostic-staff" element={<DiagnosticDashboardPage />} />

                {/* Profile Routes for all users */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/patient/profile" element={<ProfilePage />} />
                <Route path="/doctor/profile" element={<ProfilePage />} />
                <Route path="/hospital/profile" element={<ProfilePage />} />
                <Route path="/diagnostic/profile" element={<ProfilePage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <PatientMobileNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
