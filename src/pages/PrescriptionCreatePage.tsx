import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppointments, useCreatePrescription } from '../hooks/useHealthcare';
import { Button } from '../components/ui/Core';
import type { Medication } from '../types';
import { Plus, Trash2, CheckCircle2, ChevronLeft } from 'lucide-react';

export const PrescriptionCreatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const aptId = searchParams.get('aptId');
  const navigate = useNavigate();

  const { data: appointments = [] } = useAppointments();
  const createPrescriptionMutation = useCreatePrescription();

  const [selectedAptId, setSelectedAptId] = useState(aptId || appointments[0]?.id || '');
  const targetApt = appointments.find((a) => a.id === (aptId || selectedAptId)) || appointments[0];

  // Clinical Details State
  const [bloodPressure, setBloodPressure] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('74 bpm');
  const [weight, setWeight] = useState('70 kg');
  const [temperature, setTemperature] = useState('98.4 °F');
  const [spo2, setSpo2] = useState('99%');

  const [symptoms, setSymptoms] = useState<string[]>(['Chest discomfort on exertion', 'Occasional fatigue']);
  const [symptomInput, setSymptomInput] = useState('');

  const [diagnosis, setDiagnosis] = useState('Primary Hypertension, Stage 1');

  const [advisedTests, setAdvisedTests] = useState<string[]>(['Lipid Profile (Fasting)', '12-Lead ECG']);
  const [testInput, setTestInput] = useState('');

  const [medicines, setMedicines] = useState<Medication[]>([
    {
      id: 'MED-1',
      name: 'Tab. Bisoprolol (Cardibis 2.5mg)',
      dosage: '1 tablet',
      frequency: '1 + 0 + 0 (Morning)',
      duration: '30 days',
      instructions: 'Take after breakfast',
    },
    {
      id: 'MED-2',
      name: 'Tab. Atorvastatin (Lipicon 10mg)',
      dosage: '1 tablet',
      frequency: '0 + 0 + 1 (Night)',
      duration: '30 days',
      instructions: 'Take at bedtime',
    },
  ]);

  const [newMed, setNewMed] = useState<Medication>({
    id: '',
    name: '',
    dosage: '1 tablet',
    frequency: '1 + 0 + 1',
    duration: '7 days',
    instructions: 'After meals',
  });

  const [adviceInstructions, setAdviceInstructions] = useState<string[]>([
    'Reduce daily salt intake.',
    'Daily 30 minutes light exercise.',
  ]);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('2026-09-20');

  const handleAddMedicine = () => {
    if (!newMed.name) return;
    setMedicines([...medicines, { ...newMed, id: `MED-${Date.now()}` }]);
    setNewMed({
      id: '',
      name: '',
      dosage: '1 tablet',
      frequency: '1 + 0 + 1',
      duration: '7 days',
      instructions: 'After meals',
    });
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleAddTest = () => {
    if (testInput.trim()) {
      setAdvisedTests([...advisedTests, testInput.trim()]);
      setTestInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApt) return;

    try {
      await createPrescriptionMutation.mutateAsync({
        appointmentId: targetApt.id,
        vitals: { bloodPressure, pulse, weight, temperature, spo2 },
        symptoms,
        diagnosis,
        advisedTests,
        medicines,
        adviceInstructions,
        nextFollowUpDate,
      });

      alert('Prescription created and sent to patient!');
      navigate(`/doctor/prescriptions`);
    } catch (err: any) {
      alert(err.message || 'Error saving prescription');
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '960px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)', marginBottom: '1.25rem', fontWeight: 500 }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Issue Digital Prescription</h1>
              <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                Branded template is automatically matched to the practice location.
              </p>
            </div>

            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Template</span>
              <strong style={{ color: 'var(--primary-800)', fontSize: '0.875rem' }}>
                {targetApt?.institutionName || 'Hospital Chamber'}
              </strong>
            </div>
          </div>

          {/* Patient Selection Strip */}
          <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>SELECTED PATIENT</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                {targetApt?.patientName} (Serial #{targetApt?.serialNumber})
              </strong>
              <div className="text-xs text-muted">
                Age: {targetApt?.patientAge || 30} • Phone: {targetApt?.patientPhone}
              </div>
            </div>

            <div>
              <select
                className="form-select"
                value={selectedAptId}
                onChange={(e) => setSelectedAptId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Serial #{a.serialNumber}: {a.patientName} ({a.institutionName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vitals Strip - Responsive Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Patient Vitals</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">BP (mmHg)</label>
                <input type="text" className="form-input" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Pulse (bpm)</label>
                <input type="text" className="form-input" value={pulse} onChange={(e) => setPulse(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Weight (kg)</label>
                <input type="text" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Temp (°F)</label>
                <input type="text" className="form-input" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">SpO2 (%)</label>
                <input type="text" className="form-input" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Complaints & Diagnosis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Symptoms / Complaints</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Headache for 3 days"
                  className="form-input"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddSymptom}>
                  Add
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {symptoms.map((s, i) => (
                  <span key={i} className="badge badge-slate" style={{ fontSize: '0.75rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          </div>

          {/* Medications Section (Rx) */}
          <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-900)' }}>
              ℞ Medications
            </h3>

            {/* Existing medicines list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {medicines.map((m, idx) => (
                <div
                  key={m.id || idx}
                  style={{
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--slate-200)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>{idx + 1}. {m.name}</strong> — <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>{m.dosage} ({m.frequency})</span> for {m.duration}
                    <div className="text-xs text-muted">{m.instructions}</div>
                  </div>
                  <button type="button" onClick={() => handleRemoveMedicine(m.id)} style={{ color: 'var(--danger-600)', padding: '0.3rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new medication inputs */}
            <div style={{ backgroundColor: 'var(--white)', border: '1px dashed var(--slate-300)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Medicine Name"
                  className="form-input"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  className="form-input"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  className="form-input"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Duration"
                  className="form-input"
                  value={newMed.duration}
                  onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Instructions (e.g. After meals)"
                  className="form-input"
                  style={{ flex: 1, minWidth: '180px' }}
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                />
                <Button type="button" size="sm" variant="primary" onClick={handleAddMedicine} leftIcon={<Plus size={14} />}>
                  Add Drug
                </Button>
              </div>
            </div>
          </div>

          {/* Advised Tests & Follow-Up */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Advised Tests</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Fasting Lipid Profile"
                  className="form-input"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddTest}>
                  Add
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {advisedTests.map((t, i) => (
                  <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Next Follow-Up Date</label>
              <input
                type="date"
                className="form-input"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Discard
            </Button>
            <Button type="submit" variant="primary" isLoading={createPrescriptionMutation.isPending} leftIcon={<CheckCircle2 size={16} />}>
              Generate & Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
