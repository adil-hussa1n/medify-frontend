import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doctorApi,
  hospitalApi,
  diagnosticCenterApi,
  appointmentApi,
  prescriptionApi,
  diagnosticApi,
  staffApi,
  notificationApi,
  adminApi,
} from '../api';
import { Appointment, Prescription, DiagnosticOrder, Staff } from '../types';

// Doctor Hooks
export const useDoctors = (filters?: { specialization?: string; location?: string; search?: string }) => {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => doctorApi.getDoctors(filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const useDoctor = (id?: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => (id ? doctorApi.getDoctorById(id) : undefined),
    enabled: !!id,
  });
};

// Hospital Hooks
export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: () => hospitalApi.getHospitals(),
  });
};

export const useHospital = (id?: string) => {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => (id ? hospitalApi.getHospitalById(id) : undefined),
    enabled: !!id,
  });
};

// Diagnostic Centers Hooks
export const useDiagnosticCenters = () => {
  return useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: () => diagnosticCenterApi.getDiagnosticCenters(),
  });
};

export const useDiagnosticCenter = (id?: string) => {
  return useQuery({
    queryKey: ['diagnostic-center', id],
    queryFn: () => (id ? diagnosticCenterApi.getDiagnosticCenterById(id) : undefined),
    enabled: !!id,
  });
};

// Appointment Hooks
export const useAppointments = (params?: {
  patientId?: string;
  doctorId?: string;
  institutionId?: string;
  practiceLocationId?: string;
  date?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentApi.getAppointments(params),
  });
};

export const useAppointment = (id?: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => (id ? appointmentApi.getAppointmentById(id) : undefined),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof appointmentApi.createAppointment>[0]) =>
      appointmentApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) =>
      appointmentApi.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentApi.recordAppointmentCashPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Queue Hook
export const useQueue = (practiceLocationId?: string, date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['queue', practiceLocationId, targetDate],
    queryFn: () => (practiceLocationId ? appointmentApi.getQueueState(practiceLocationId, targetDate) : undefined),
    enabled: !!practiceLocationId,
    refetchInterval: 5000, // Poll queue state simulating live feed
  });
};

// Prescription Hooks
export const usePrescriptions = (params?: { patientId?: string; doctorId?: string }) => {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => prescriptionApi.getPrescriptions(params),
  });
};

export const usePrescription = (id?: string) => {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => (id ? prescriptionApi.getPrescriptionById(id) : undefined),
    enabled: !!id,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof prescriptionApi.createPrescription>[0]) =>
      prescriptionApi.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Diagnostic Tests & Orders Hooks
export const useDiagnosticTests = (filters?: { centerId?: string; search?: string }) => {
  return useQuery({
    queryKey: ['diagnostic-tests', filters],
    queryFn: () => diagnosticApi.getTests(filters),
  });
};

export const useDiagnosticOrders = (filters?: { patientId?: string; centerId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['diagnostic-orders', filters],
    queryFn: () => diagnosticApi.getOrders(filters),
  });
};

export const useCreateDiagnosticOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof diagnosticApi.createOrder>[0]) => diagnosticApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-orders'] });
    },
  });
};

export const useUpdateDiagnosticOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reportUrl }: { id: string; status: DiagnosticOrder['status']; reportUrl?: string }) =>
      diagnosticApi.updateOrderStatus(id, status, reportUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-orders'] });
    },
  });
};

// Staff Hook
export const useStaff = (filters?: { institutionId?: string; assignedDoctorId?: string }) => {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffApi.getStaff(filters),
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Staff>) => staffApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

// Notifications Hook
export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => (userId ? notificationApi.getNotifications(userId) : []),
    enabled: !!userId,
  });
};

// Admin Hooks
export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });
};
