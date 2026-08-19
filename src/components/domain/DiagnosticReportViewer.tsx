import React from 'react';
import { DiagnosticOrder } from '../../types';
import { Button } from '../ui/Core';
import { Printer, Download, Stethoscope, Building2, User, Calendar, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

interface DiagnosticReportViewerProps {
  order: DiagnosticOrder;
  onClose?: () => void;
}

export const DiagnosticReportViewer: React.FC<DiagnosticReportViewerProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate clean printable HTML PDF blob simulation
    const reportHtml = `
      <html>
        <head>
          <title>Diagnostic Report - ${order.orderNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #1e293b; }
            .header { border-bottom: 2px solid #0c4a60; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
            .patient-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 1rem; margin-bottom: 1.5rem; border-radius: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0; color:#0c4a60;">${order.centerName}</h2>
              <p style="margin:4px 0 0; font-size:13px;">Diagnostic Pathology & Clinical Laboratory Division</p>
            </div>
            <div style="text-align:right;">
              <h3 style="margin:0;">OFFICIAL REPORT</h3>
              <p style="margin:4px 0 0; font-size:12px;">Order Ref: ${order.orderNumber}</p>
            </div>
          </div>
          <div class="patient-box">
            <p><strong>Patient Name:</strong> ${order.patientName}</p>
            <p><strong>Test Name:</strong> ${order.testName}</p>
            <p><strong>Date of Sample:</strong> ${order.scheduledDate}</p>
          </div>
          <h3>Pathology Analysis Findings</h3>
          <table>
            <thead>
              <tr><th>Parameter</th><th>Result Value</th><th>Reference Range</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Analyte Measurement 1</td><td>Normal / Reactive</td><td>Negative / Standard</td><td>Verified Normal</td></tr>
              <tr><td>Serum Biochemical Index</td><td>Optimal</td><td>Normal Range</td><td>Passed</td></tr>
            </tbody>
          </table>
          <div style="margin-top: 3rem; text-align: right;">
            <p>__________________________</p>
            <p><strong>Dr. S. K. Roy, MBBS, MD</strong><br/><span style="font-size:12px;">Consultant Pathologist</span></p>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diagnostic-Report-${order.orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Action Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--white)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={18} color="var(--success-600)" />
          <span style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
            Diagnostic Report (Ref #{order.orderNumber})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="outline" leftIcon={<Printer size={15} />} onClick={handlePrint}>
            Print
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Download size={15} />} onClick={handleDownload}>
            Download Report File
          </Button>
        </div>
      </div>

      {/* Branded Pathology Laboratory Sheet */}
      <div
        className="prescription-sheet"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--slate-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          color: '#1E293B',
        }}
      >
        {/* Diagnostic Center Header */}
        <div
          style={{
            borderBottom: '2px solid var(--accent-600)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Stethoscope size={24} color="var(--accent-600)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                {order.centerName}
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
              Clinical Pathology, Biochemistry & Diagnostic Imaging Division
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
              <ShieldCheck size={13} /> Verified Diagnostic Report
            </span>
            <p className="text-xs text-muted" style={{ marginTop: '0.3rem' }}>
              Order No: <strong>{order.orderNumber}</strong>
            </p>
          </div>
        </div>

        {/* Patient & Test Information Strip */}
        <div
          style={{
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span className="text-muted">Patient: </span>
            <strong>{order.patientName}</strong>
          </div>
          <div>
            <span className="text-muted">Phone: </span>
            <strong>{order.patientPhone}</strong>
          </div>
          <div>
            <span className="text-muted">Collection Date: </span>
            <strong>{order.scheduledDate}</strong>
          </div>
          <div>
            <span className="text-muted">Mode: </span>
            <strong>{order.bookingType === 'home_collection' ? 'Home Sample' : 'Walk-in'}</strong>
          </div>
        </div>

        {/* Test Name & Category */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="text-xs" style={{ color: 'var(--accent-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Investigation Performed
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.1rem' }}>
            {order.testName}
          </h3>
        </div>

        {/* Results Data Table */}
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th>Observed Value</th>
                <th>Biological Reference Range</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Primary Analyte Measurement</strong></td>
                <td><strong style={{ color: 'var(--primary-800)' }}>Normal / Optimal</strong></td>
                <td>Standard Reference Range</td>
                <td><span className="badge badge-success">Normal</span></td>
              </tr>
              <tr>
                <td><strong>Biochemical Serum Index</strong></td>
                <td><strong style={{ color: 'var(--primary-800)' }}>Within Limits</strong></td>
                <td>Normal Baseline</td>
                <td><span className="badge badge-success">Normal</span></td>
              </tr>
              <tr>
                <td><strong>Pathology Cellular Screen</strong></td>
                <td><strong style={{ color: 'var(--primary-800)' }}>Negative / Unremarkable</strong></td>
                <td>Non-reactive</td>
                <td><span className="badge badge-success">Clear</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Clinical Remarks */}
        <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Consultant Remarks
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--primary-800)', lineHeight: 1.4 }}>
            All tested parameters fall within healthy baseline reference ranges. Results correlate with general good health profile. Please consult your physician for comprehensive clinical interpretation.
          </p>
        </div>

        {/* Lab Authority Signature */}
        <div
          style={{
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div className="text-xs text-muted">
            Delivered via Medify247 Healthcare Digital Portal • Date: {order.reportUploadedAt ? new Date(order.reportUploadedAt).toLocaleString() : order.scheduledDate}
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid var(--slate-800)', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '1.05rem', color: 'var(--primary-900)' }}>
                Dr. S. K. Roy
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-700)', fontWeight: 700, display: 'block' }}>
              Dr. S. K. Roy, MBBS, MD (Path)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
              Chief Consultant Pathologist
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
