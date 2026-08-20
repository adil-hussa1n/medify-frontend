import React, { useState } from 'react';
import { useDoctors, useHospitals, useDiagnosticCenters, useAuditLogs, useAppointments, useDiagnosticOrders } from '../hooks/useHealthcare';
import { Button, Modal } from '../components/ui/Core';
import { Shield, Plus, Edit, Trash2, CheckCircle2, Search, Building2, Stethoscope, User, Calendar, Activity, DollarSign, Receipt, TrendingUp, Layers, Filter } from 'lucide-react';
import { doctorApi, hospitalApi, diagnosticCenterApi } from '../api';
import { FinancialReportView, FinancialItem } from '../components/domain/FinancialReportView';

export const SuperAdminDashboardPage: React.FC = () => {
  const { data: doctors = [], refetch: refetchDoctors } = useDoctors();
  const { data: hospitals = [], refetch: refetchHospitals } = useHospitals();
  const { data: diagnosticCenters = [], refetch: refetchCenters } = useDiagnosticCenters();
  const { data: auditLogs = [] } = useAuditLogs();
  const { data: appointments = [] } = useAppointments();
  const { data: diagnosticOrders = [] } = useDiagnosticOrders();

  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'hospitals' | 'diagnostic' | 'audit' | 'financials'>('overview');
  const [finScopeFilter, setFinScopeFilter] = useState<'all' | 'doctors' | 'hospitals' | 'diagnostic'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Create/Edit Doctor Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('Cardiologist');
  const [docQual, setDocQual] = useState('MBBS, FCPS');
  const [docReg, setDocReg] = useState('');

  // 2. Create/Edit Hospital Modal
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [hospName, setHospName] = useState('');
  const [hospCity, setHospCity] = useState('Dhaka');

  // 3. Create/Edit Diagnostic Center Modal
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [editingDiagId, setEditingDiagId] = useState<string | null>(null);
  const [diagName, setDiagName] = useState('');
  const [diagCity, setDiagCity] = useState('Dhaka');

  // Doctor CRUD
  const handleOpenCreateDoctor = () => {
    setEditingDoctorId(null);
    setDocName('');
    setDocSpec('Cardiologist');
    setDocQual('MBBS, FCPS');
    setDocReg('');
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: any) => {
    setEditingDoctorId(doc.id);
    setDocName(doc.name);
    setDocSpec(doc.specialization);
    setDocQual(doc.qualifications?.join(', ') || 'MBBS');
    setDocReg(doc.registrationNumber || '');
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctorId) {
      const doc = doctors.find((d) => d.id === editingDoctorId);
      if (doc) {
        doc.name = docName;
        doc.specialization = docSpec;
        doc.qualifications = docQual.split(',').map((s) => s.trim());
        doc.registrationNumber = docReg;
      }
    } else {
      await doctorApi.createDoctor({
        name: docName,
        specialization: docSpec,
        qualifications: docQual.split(',').map((s) => s.trim()),
        registrationNumber: docReg || `BMDC Reg #A-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    }
    setIsDoctorModalOpen(false);
    refetchDoctors();
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor from directory?')) {
      const idx = doctors.findIndex((d) => d.id === id);
      if (idx !== -1) doctors.splice(idx, 1);
      refetchDoctors();
    }
  };

  // Hospital CRUD
  const handleOpenCreateHospital = () => {
    setEditingHospitalId(null);
    setHospName('');
    setHospCity('Dhaka');
    setIsHospitalModalOpen(true);
  };

  const handleOpenEditHospital = (hosp: any) => {
    setEditingHospitalId(hosp.id);
    setHospName(hosp.name);
    setHospCity(hosp.city);
    setIsHospitalModalOpen(true);
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHospitalId) {
      const hosp = hospitals.find((h) => h.id === editingHospitalId);
      if (hosp) {
        hosp.name = hospName;
        hosp.city = hospCity;
      }
    } else {
      await hospitalApi.createHospital({
        name: hospName,
        city: hospCity,
      });
    }
    setIsHospitalModalOpen(false);
    refetchHospitals();
  };

  const handleDeleteHospital = (id: string) => {
    if (window.confirm('Delete this hospital entity?')) {
      const idx = hospitals.findIndex((h) => h.id === id);
      if (idx !== -1) hospitals.splice(idx, 1);
      refetchHospitals();
    }
  };

  // Diagnostic CRUD
  const handleOpenCreateDiag = () => {
    setEditingDiagId(null);
    setDiagName('');
    setDiagCity('Dhaka');
    setIsDiagModalOpen(true);
  };

  const handleOpenEditDiag = (diag: any) => {
    setEditingDiagId(diag.id);
    setDiagName(diag.name);
    setDiagCity(diag.city);
    setIsDiagModalOpen(true);
  };

  const handleSaveDiag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDiagId) {
      const diag = diagnosticCenters.find((d) => d.id === editingDiagId);
      if (diag) {
        diag.name = diagName;
        diag.city = diagCity;
      }
    } else {
      await diagnosticCenterApi.createDiagnosticCenter({
        name: diagName,
        city: diagCity,
      });
    }
    setIsDiagModalOpen(false);
    refetchCenters();
  };

  const handleDeleteDiag = (id: string) => {
    if (window.confirm('Delete this diagnostic center entity?')) {
      const idx = diagnosticCenters.findIndex((d) => d.id === id);
      if (idx !== -1) diagnosticCenters.splice(idx, 1);
      refetchCenters();
    }
  };

  // Filtered Lists by Search
  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiagnostic = diagnosticCenters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container page-wrapper" style={{ maxWidth: '1120px' }}>
      {/* Super Admin Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={22} color="var(--primary-800)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Super Admin Platform Hub</h1>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>
            Unified Ecosystem Governance & Direct Entity Provisioning (Doctors, Hospitals, Diagnostic Centers, and Audit Logs).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', width: '100%', maxWidth: '380px' }}>
          <Button variant="primary" size="sm" style={{ flex: 1 }} leftIcon={<Plus size={14} />} onClick={handleOpenCreateDoctor}>
            Add Doctor
          </Button>
          <Button variant="secondary" size="sm" style={{ flex: 1 }} leftIcon={<Plus size={14} />} onClick={handleOpenCreateHospital}>
            Add Hospital
          </Button>
          <Button variant="outline" size="sm" style={{ flex: 1 }} leftIcon={<Plus size={14} />} onClick={handleOpenCreateDiag}>
            Add Center
          </Button>
        </div>
      </div>

      {/* Ecosystem KPI Summary */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Total Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{doctors.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Hospitals</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{hospitals.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Diagnostic Centers</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{diagnosticCenters.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Audit Trail</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-700)' }}>{auditLogs.length}</strong>
        </div>
      </div>

      {/* Navigation Tabs & Search Input */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Complete Overview
          </button>
          <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
            Doctors ({doctors.length})
          </button>
          <button className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
            Hospitals ({hospitals.length})
          </button>
          <button className={`tab-btn ${activeTab === 'diagnostic' ? 'active' : ''}`} onClick={() => setActiveTab('diagnostic')}>
            Diagnostic Centers ({diagnosticCenters.length})
          </button>
          <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            Audit Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <DollarSign size={14} />
            Financial Report & Medify Profit
          </button>
        </div>

        <div style={{ width: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.65rem' }}
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🌟 COMPLETE OVERVIEW TAB (Includes Doctors, Hospitals & Diagnostic Centers) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Section 1: Partner Hospitals Preview */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={18} color="var(--primary-800)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Affiliated Partner Hospitals ({hospitals.length})</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('hospitals')}>
                Manage Hospitals →
              </Button>
            </div>
            <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
              {filteredHospitals.slice(0, 3).map((h) => (
                <div key={h.id} style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{h.name}</h4>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>
                  </div>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{h.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Diagnostic Centers Preview */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={18} color="var(--accent-600)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Diagnostic Centers & Labs ({diagnosticCenters.length})</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('diagnostic')}>
                Manage Centers →
              </Button>
            </div>
            <div className="grid grid-cols-3 md-grid-cols-2 sm-grid-cols-1 gap-3">
              {filteredDiagnostic.slice(0, 3).map((c) => (
                <div key={c.id} style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.name}</h4>
                    <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>DGHS Lab</span>
                  </div>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{c.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Verified Doctors Preview */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={18} color="var(--primary-800)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Verified Specialist Doctors ({doctors.length})</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('doctors')}>
                Manage Doctors →
              </Button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Chambers</th>
                    <th>Registration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.slice(0, 4).map((doc) => (
                    <tr key={doc.id}>
                      <td><strong>{doc.name}</strong></td>
                      <td><span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>{doc.specialization}</span></td>
                      <td><span className="badge badge-primary">{doc.practiceLocations.length} Locations</span></td>
                      <td><span className="text-xs text-muted">{doc.registrationNumber}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. Doctors CRUD Table Tab */}
      {activeTab === 'doctors' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Global Doctors Directory</h2>
            <Button size="sm" variant="primary" leftIcon={<Plus size={13} />} onClick={handleOpenCreateDoctor}>
              Add Doctor
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name & Specialization</th>
                  <th>BMDC Registration</th>
                  <th>Chambers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      <div className="text-xs" style={{ color: 'var(--primary-700)' }}>{doc.specialization}</div>
                    </td>
                    <td><div className="text-xs text-muted">{doc.registrationNumber}</div></td>
                    <td><span className="badge badge-primary">{doc.practiceLocations.length} Chambers</span></td>
                    <td><span className="badge badge-success">Verified</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditDoctor(doc)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteDoctor(doc.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Hospitals CRUD Table Tab */}
      {activeTab === 'hospitals' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Partner Hospitals Registry</h2>
            <Button size="sm" variant="primary" leftIcon={<Plus size={13} />} onClick={handleOpenCreateHospital}>
              Add Hospital
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Registration</th>
                  <th>City & Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((hosp) => (
                  <tr key={hosp.id}>
                    <td>
                      <strong>{hosp.name}</strong>
                      <div className="text-xs text-muted">{hosp.email}</div>
                    </td>
                    <td><span className="badge badge-slate">{hosp.registrationNumber}</span></td>
                    <td>
                      <div>{hosp.city}</div>
                      <div className="text-xs text-muted">{hosp.address}</div>
                    </td>
                    <td><span className="badge badge-success">Approved</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditHospital(hosp)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteHospital(hosp.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Diagnostic Centers CRUD Table Tab */}
      {activeTab === 'diagnostic' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Diagnostic Centers Registry</h2>
            <Button size="sm" variant="primary" leftIcon={<Plus size={13} />} onClick={handleOpenCreateDiag}>
              Add Center
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Center Name</th>
                  <th>DGHS Reg</th>
                  <th>City</th>
                  <th>Home Collection</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiagnostic.map((diag) => (
                  <tr key={diag.id}>
                    <td><strong>{diag.name}</strong></td>
                    <td><span className="badge badge-slate">{diag.registrationNumber}</span></td>
                    <td>{diag.city}</td>
                    <td>
                      {diag.offersHomeCollection ? (
                        <span className="badge badge-accent">Yes</span>
                      ) : (
                        <span className="badge badge-slate">No</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditDiag(diag)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteDiag(diag.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Audit Logs Table Tab */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Platform Audit Trail</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="text-xs text-muted">{new Date(log.timestamp).toLocaleString()}</span></td>
                    <td><strong>{log.actorName}</strong> ({log.actorRole})</td>
                    <td><span className="badge badge-primary">{log.action}</span></td>
                    <td><div className="text-xs">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUPER ADMIN FINANCIAL REPORT & MEDIFY PROFIT TAB */}
      {activeTab === 'financials' && (() => {
        // Transform appointments into FinancialItem format
        const appointmentFinancials: FinancialItem[] = appointments.map((apt) => ({
          id: apt.id,
          type: apt.locationType === 'hospital' ? 'hospital_opd' : 'doctor_appointment',
          title: `Consultation (${apt.doctorName} • ${apt.doctorSpecialization})`,
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          referenceNo: `#${apt.serialNumber} • ${apt.id}`,
          date: apt.appointmentDate,
          grossAmount: apt.consultationFee || 0,
          medifyFee: 20,
          netAmount: Math.max(0, (apt.consultationFee || 0) - 20),
          paymentStatus: apt.paymentStatus === 'paid' ? 'paid' : 'unpaid',
          paymentMethod: apt.paymentMethod,
          chamberOrDept: apt.chamberName || apt.institutionName || 'Doctor Chamber',
          doctorName: apt.doctorName,
          category: apt.locationType === 'hospital' ? 'hospital' : apt.locationType === 'diagnostic_center' ? 'diagnostic' : 'doctor',
        }));

        // Transform diagnostic orders into FinancialItem format
        const diagnosticFinancials: FinancialItem[] = diagnosticOrders.map((ord) => ({
          id: ord.id,
          type: 'diagnostic_test',
          title: `Lab Test: ${ord.testName}`,
          patientName: ord.patientName,
          patientPhone: ord.patientPhone,
          referenceNo: ord.orderNumber,
          date: ord.scheduledDate,
          grossAmount: ord.testPrice || 0,
          medifyFee: 20,
          netAmount: Math.max(0, (ord.testPrice || 0) - 20),
          paymentStatus: ord.paymentStatus === 'paid' ? 'paid' : 'unpaid',
          paymentMethod: ord.paymentMethod,
          chamberOrDept: ord.centerName || 'Diagnostic Center',
          category: 'diagnostic',
        }));

        const allPlatformFinancials = [...appointmentFinancials, ...diagnosticFinancials];

        // Filter by selected Super Admin Scope
        const scopedItems = allPlatformFinancials.filter((item) => {
          if (finScopeFilter === 'doctors') return item.category === 'doctor';
          if (finScopeFilter === 'hospitals') return item.category === 'hospital';
          if (finScopeFilter === 'diagnostic') return item.category === 'diagnostic';
          return true;
        });

        const doctorCount = allPlatformFinancials.filter((i) => i.category === 'doctor').length;
        const hospitalCount = allPlatformFinancials.filter((i) => i.category === 'hospital').length;
        const diagnosticCount = allPlatformFinancials.filter((i) => i.category === 'diagnostic').length;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Super Admin Financial Entity Scope Switcher */}
            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={16} color="var(--primary-800)" />
                    Platform Financial Scope Breakdown
                  </h3>
                  <p className="text-xs text-muted">Toggle between unified ecosystem collections or inspect individual sector performance.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className={`btn btn-sm ${finScopeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFinScopeFilter('all')}
                  >
                    🌐 All Platform ({allPlatformFinancials.length})
                  </button>
                  <button
                    className={`btn btn-sm ${finScopeFilter === 'doctors' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFinScopeFilter('doctors')}
                  >
                    🩺 Doctor Chambers ({doctorCount})
                  </button>
                  <button
                    className={`btn btn-sm ${finScopeFilter === 'hospitals' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFinScopeFilter('hospitals')}
                  >
                    🏥 Partner Hospitals ({hospitalCount})
                  </button>
                  <button
                    className={`btn btn-sm ${finScopeFilter === 'diagnostic' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFinScopeFilter('diagnostic')}
                  >
                    🔬 Diagnostic Centers ({diagnosticCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Reusable Financial Report with Multi-Filtering & Medify ৳20 Commission */}
            <FinancialReportView
              title={
                finScopeFilter === 'all'
                  ? 'Super Admin Unified Platform Financial Report'
                  : finScopeFilter === 'doctors'
                  ? 'Doctor Chambers & Private Practice Collections'
                  : finScopeFilter === 'hospitals'
                  ? 'Partner Hospitals Financial Statement'
                  : 'Diagnostic & Pathology Centers Financial Statement'
              }
              subtitle={`Ecosystem transaction volume, ৳20 platform commission charges, and institutional payouts.`}
              tenantName="Medify 24/7 Platform Ecosystem"
              tenantType="superadmin"
              items={scopedItems}
            />
          </div>
        );
      })()}

      {/* Doctor Modal (Create & Edit) */}
      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title={editingDoctorId ? 'Edit Doctor Profile' : 'Direct Create Doctor'}>
        <form onSubmit={handleSaveDoctor}>
          <div className="form-group">
            <label className="form-label">Doctor Full Name *</label>
            <input type="text" required placeholder="e.g. Prof. Dr. Kamal Ahmed" className="form-input" value={docName} onChange={(e) => setDocName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization *</label>
            <input type="text" required placeholder="e.g. Cardiologist" className="form-input" value={docSpec} onChange={(e) => setDocSpec(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Qualifications</label>
            <input type="text" placeholder="e.g. MBBS, FCPS, MD" className="form-input" value={docQual} onChange={(e) => setDocQual(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">BMDC Registration Number</label>
            <input type="text" placeholder="e.g. BMDC Reg #A-99201" className="form-input" value={docReg} onChange={(e) => setDocReg(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDoctorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDoctorId ? 'Save Changes' : 'Create & Verify'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Hospital Modal (Create & Edit) */}
      <Modal isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} title={editingHospitalId ? 'Edit Hospital Entity' : 'Create Hospital'}>
        <form onSubmit={handleSaveHospital}>
          <div className="form-group">
            <label className="form-label">Hospital Name *</label>
            <input type="text" required placeholder="e.g. Apollo Hospital" className="form-input" value={hospName} onChange={(e) => setHospName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input type="text" required className="form-input" value={hospCity} onChange={(e) => setHospCity(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsHospitalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingHospitalId ? 'Save Changes' : 'Create Hospital'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diagnostic Center Modal (Create & Edit) */}
      <Modal isOpen={isDiagModalOpen} onClose={() => setIsDiagModalOpen(false)} title={editingDiagId ? 'Edit Diagnostic Center' : 'Create Diagnostic Center'}>
        <form onSubmit={handleSaveDiag}>
          <div className="form-group">
            <label className="form-label">Center Name *</label>
            <input type="text" required placeholder="e.g. Ibn Sina Diagnostic Center" className="form-input" value={diagName} onChange={(e) => setDiagName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input type="text" required className="form-input" value={diagCity} onChange={(e) => setDiagCity(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDiagModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDiagId ? 'Save Changes' : 'Create Center'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
