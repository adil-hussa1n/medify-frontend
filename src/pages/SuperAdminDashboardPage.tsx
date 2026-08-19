import React, { useState } from 'react';
import { useDoctors, useHospitals, useDiagnosticCenters, useAuditLogs } from '../hooks/useHealthcare';
import { Button, Modal } from '../components/ui/Core';
import { Shield, Plus } from 'lucide-react';
import { doctorApi, hospitalApi, diagnosticCenterApi } from '../api';

export const SuperAdminDashboardPage: React.FC = () => {
  const { data: doctors = [], refetch: refetchDoctors } = useDoctors();
  const { data: hospitals = [], refetch: refetchHospitals } = useHospitals();
  const { data: diagnosticCenters = [], refetch: refetchCenters } = useDiagnosticCenters();
  const { data: auditLogs = [] } = useAuditLogs();

  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'hospitals' | 'diagnostic' | 'audit'>('overview');

  // Create Doctor Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('Cardiologist');
  const [docQual, setDocQual] = useState('MBBS, FCPS');
  const [docReg, setDocReg] = useState('');

  // Create Hospital Modal
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospCity, setHospCity] = useState('Dhaka');

  // Create Diagnostic Center Modal
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [diagName, setDiagName] = useState('');
  const [diagCity, setDiagCity] = useState('Dhaka');

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    await doctorApi.createDoctor({
      name: docName,
      specialization: docSpec,
      qualifications: docQual.split(',').map((s) => s.trim()),
      registrationNumber: docReg || `BMDC Reg #A-${Math.floor(10000 + Math.random() * 90000)}`,
    });
    setIsDoctorModalOpen(false);
    setDocName('');
    refetchDoctors();
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    await hospitalApi.createHospital({
      name: hospName,
      city: hospCity,
    });
    setIsHospitalModalOpen(false);
    setHospName('');
    refetchHospitals();
  };

  const handleCreateDiagnosticCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    await diagnosticCenterApi.createDiagnosticCenter({
      name: diagName,
      city: diagCity,
    });
    setIsDiagModalOpen(false);
    setDiagName('');
    refetchCenters();
  };

  return (
    <div className="container page-wrapper">
      {/* Super Admin Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={22} color="var(--primary-800)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Super Admin Platform Hub</h1>
          </div>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.8rem' }}>
            Ecosystem governance & direct entity provisioning
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', width: '100%' }}>
          <Button variant="primary" size="sm" style={{ flex: 1, minWidth: '110px' }} leftIcon={<Plus size={14} />} onClick={() => setIsDoctorModalOpen(true)}>
            Add Doctor
          </Button>
          <Button variant="secondary" size="sm" style={{ flex: 1, minWidth: '110px' }} leftIcon={<Plus size={14} />} onClick={() => setIsHospitalModalOpen(true)}>
            Add Hospital
          </Button>
          <Button variant="outline" size="sm" style={{ flex: 1, minWidth: '110px' }} leftIcon={<Plus size={14} />} onClick={() => setIsDiagModalOpen(true)}>
            Add Center
          </Button>
        </div>
      </div>

      {/* Ecosystem KPI Summary */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Doctors</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>{doctors.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Hospitals</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-800)' }}>{hospitals.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Centers</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--accent-600)' }}>{diagnosticCenters.length}</strong>
        </div>
        <div className="card" style={{ padding: '0.85rem' }}>
          <span className="text-xs text-muted" style={{ display: 'block' }}>Logs</span>
          <strong style={{ fontSize: '1.35rem', color: 'var(--slate-700)' }}>{auditLogs.length}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          Doctors ({doctors.length})
        </button>
        <button className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
          Hospitals ({hospitals.length})
        </button>
        <button className={`tab-btn ${activeTab === 'diagnostic' ? 'active' : ''}`} onClick={() => setActiveTab('diagnostic')}>
          Centers ({diagnosticCenters.length})
        </button>
        <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          Audit Logs
        </button>
      </div>

      {/* Overview / Doctors List */}
      {(activeTab === 'overview' || activeTab === 'doctors') && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Global Doctors Directory</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Doctor Name</th>
                  <th>Specialization & Reg</th>
                  <th>Locations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      <div className="text-xs text-muted">{doc.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{doc.specialization}</div>
                      <div className="text-xs text-muted">{doc.registrationNumber}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{doc.practiceLocations.length} Chambers</span>
                    </td>
                    <td>
                      <span className="badge badge-success">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Doctor Direct Modal */}
      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title="Direct Create Doctor">
        <form onSubmit={handleCreateDoctor}>
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
              Create & Verify
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Hospital Modal */}
      <Modal isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} title="Create Hospital">
        <form onSubmit={handleCreateHospital}>
          <div className="form-group">
            <label className="form-label">Hospital Name *</label>
            <input type="text" required placeholder="e.g. Apollo Hospital" className="form-input" value={hospName} onChange={(e) => setHospName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input type="text" required defaultValue="Dhaka" className="form-input" value={hospCity} onChange={(e) => setHospCity(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsHospitalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Hospital
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Diagnostic Center Modal */}
      <Modal isOpen={isDiagModalOpen} onClose={() => setIsDiagModalOpen(false)} title="Create Diagnostic Center">
        <form onSubmit={handleCreateDiagnosticCenter}>
          <div className="form-group">
            <label className="form-label">Center Name *</label>
            <input type="text" required placeholder="e.g. Ibn Sina Diagnostic Center" className="form-input" value={diagName} onChange={(e) => setDiagName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input type="text" required defaultValue="Dhaka" className="form-input" value={diagCity} onChange={(e) => setDiagCity(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDiagModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Center
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
