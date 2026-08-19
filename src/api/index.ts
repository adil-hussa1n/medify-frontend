import { mockDb } from './mock/mockDb';
import {
  Doctor,
  Hospital,
  DiagnosticCenter,
  Appointment,
  Prescription,
  DiagnosticTest,
  DiagnosticOrder,
  Staff,
  AppNotification,
  AuditLog,
  QueueState,
} from '../types';

export const API_MODE = import.meta.env.VITE_API_MODE || 'mock';

// DOCTORS API
export const doctorApi = {
  getDoctors: async (filters?: { specialization?: string; location?: string; search?: string }): Promise<Doctor[]> => {
    return mockDb.getDoctors(filters);
  },
  getDoctorById: async (id: string): Promise<Doctor | undefined> => {
    return mockDb.getDoctorById(id);
  },
  createDoctor: async (data: Partial<Doctor>): Promise<Doctor> => {
    return mockDb.createDoctor(data);
  },
  addPracticeLocation: async (doctorId: string, loc: any) => {
    return mockDb.addPracticeLocation(doctorId, loc);
  },
};

// HOSPITALS API
export const hospitalApi = {
  getHospitals: async (): Promise<Hospital[]> => {
    return mockDb.getHospitals();
  },
  getHospitalById: async (id: string): Promise<Hospital | undefined> => {
    return mockDb.getHospitalById(id);
  },
  createHospital: async (data: Partial<Hospital>): Promise<Hospital> => {
    return mockDb.createHospital(data);
  },
};

// DIAGNOSTIC CENTERS API
export const diagnosticCenterApi = {
  getDiagnosticCenters: async (): Promise<DiagnosticCenter[]> => {
    return mockDb.getDiagnosticCenters();
  },
  getDiagnosticCenterById: async (id: string): Promise<DiagnosticCenter | undefined> => {
    return mockDb.getDiagnosticCenterById(id);
  },
  createDiagnosticCenter: async (data: Partial<DiagnosticCenter>): Promise<DiagnosticCenter> => {
    return mockDb.createDiagnosticCenter(data);
  },
};

// APPOINTMENTS API
export const appointmentApi = {
  getAppointments: async (params?: {
    patientId?: string;
    doctorId?: string;
    institutionId?: string;
    practiceLocationId?: string;
    date?: string;
    status?: string;
  }): Promise<Appointment[]> => {
    return mockDb.getAppointments(params);
  },
  getAppointmentById: async (id: string): Promise<Appointment | undefined> => {
    return mockDb.getAppointmentById(id);
  },
  createAppointment: async (bookingData: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientAge?: number;
    patientGender?: 'male' | 'female' | 'other';
    doctorId: string;
    practiceLocationId: string;
    appointmentDate: string;
    desiredSerial?: number;
    notes?: string;
  }): Promise<Appointment> => {
    return mockDb.createAppointment(bookingData);
  },
  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']): Promise<Appointment> => {
    return mockDb.updateAppointmentStatus(appointmentId, status);
  },
  recordAppointmentCashPayment: async (appointmentId: string): Promise<Appointment> => {
    return mockDb.recordAppointmentCashPayment(appointmentId);
  },
  getQueueState: async (practiceLocationId: string, date: string): Promise<QueueState> => {
    return mockDb.getQueueState(practiceLocationId, date);
  },
};

// PRESCRIPTIONS API
export const prescriptionApi = {
  getPrescriptions: async (params?: { patientId?: string; doctorId?: string }): Promise<Prescription[]> => {
    return mockDb.getPrescriptions(params);
  },
  getPrescriptionById: async (id: string): Promise<Prescription | undefined> => {
    return mockDb.getPrescriptionById(id);
  },
  createPrescription: async (data: Partial<Prescription> & { appointmentId: string }): Promise<Prescription> => {
    return mockDb.createPrescription(data);
  },
};

// DIAGNOSTIC TESTS & ORDERS API
export const diagnosticApi = {
  getTests: async (filters?: { centerId?: string; search?: string }): Promise<DiagnosticTest[]> => {
    return mockDb.getDiagnosticTests(filters);
  },
  createTest: async (data: Partial<DiagnosticTest>): Promise<DiagnosticTest> => {
    return mockDb.createDiagnosticTest(data);
  },
  getOrders: async (filters?: { patientId?: string; centerId?: string; status?: string }): Promise<DiagnosticOrder[]> => {
    return mockDb.getDiagnosticOrders(filters);
  },
  createOrder: async (data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientAddress?: string;
    diagnosticCenterId: string;
    testId: string;
    bookingType: 'walk_in' | 'home_collection';
    scheduledDate: string;
    timeSlot: string;
  }): Promise<DiagnosticOrder> => {
    return mockDb.createDiagnosticOrder(data);
  },
  updateOrderStatus: async (orderId: string, status: DiagnosticOrder['status'], reportUrl?: string): Promise<DiagnosticOrder> => {
    return mockDb.updateDiagnosticOrderStatus(orderId, status, reportUrl);
  },
};

// STAFF API
export const staffApi = {
  getStaff: async (filters?: { institutionId?: string; assignedDoctorId?: string }): Promise<Staff[]> => {
    return mockDb.getStaff(filters);
  },
  createStaff: async (data: Partial<Staff>): Promise<Staff> => {
    return mockDb.createStaff(data);
  },
};

// NOTIFICATIONS API
export const notificationApi = {
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    return mockDb.getNotifications(userId);
  },
  markRead: async (id: string): Promise<AppNotification | undefined> => {
    return mockDb.markNotificationRead(id);
  },
};

// ADMIN & AUDIT LOGS API
export const adminApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return mockDb.getAuditLogs();
  },
};
