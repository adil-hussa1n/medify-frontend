export type UserRole =
  | 'patient'
  | 'doctor'
  | 'doctor_staff'
  | 'hospital'
  | 'hospital_staff'
  | 'diagnostic'
  | 'diagnostic_staff'
  | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  diagnosticCenterId?: string;
  assignedDoctorId?: string;
  assignedLocationId?: string;
  assignedChamberName?: string;
  staffTaskType?: 'chamber_desk' | 'lab_desk';
  address?: string;
  bio?: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  emergencyContact?: string;
}

export type LocationType = 'hospital' | 'diagnostic_center' | 'individual_chamber';

export interface PracticeLocation {
  id: string;
  doctorId: string;
  institutionId?: string;
  institutionName: string;
  locationType: LocationType;
  chamberName: string;
  address: string;
  city: string;
  phone: string;
  consultationFee: number;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  dailyPatientLimit: number;
  status: 'active' | 'inactive';
  photos?: string[];
}

export interface Doctor {
  id: string; // One single global doctor ID across all locations
  userId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  registrationNumber: string;
  isVerified: boolean;
  about: string;
  practiceLocations: PracticeLocation[];
}

export interface Hospital {
  id: string;
  userId: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website?: string;
  logoUrl: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  departments: string[];
  totalChambers: number;
  doctorCount: number;
  createdAt: string;
}

export interface DiagnosticCenter {
  id: string;
  userId: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website?: string;
  logoUrl: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  offersHomeCollection: boolean;
  testCount: number;
  doctorCount: number;
  createdAt: string;
}

export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor_staff' | 'hospital_staff' | 'diagnostic_staff';
  designation: 'Assistant' | 'Manager' | 'Receptionist' | 'Lab Technician' | 'Sample Collector';
  institutionId?: string;
  institutionName?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedLocationId?: string;
  assignedChamberName?: string;
  status: 'active' | 'inactive';
}

export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'checked_in'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  practiceLocationId: string;
  institutionId?: string;
  institutionName: string;
  locationType: LocationType;
  chamberName: string;
  address: string;
  appointmentDate: string; // YYYY-MM-DD
  serialNumber: number;
  estimatedTime: string;
  consultationFee: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: 'cash'; // CASH ONLY
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  hasPrescription?: boolean;
  prescriptionId?: string;
}

export interface QueueState {
  practiceLocationId: string;
  doctorId: string;
  doctorName: string;
  institutionName: string;
  chamberName: string;
  date: string;
  totalBooked: number;
  currentSerialServing: number;
  checkedInCount: number;
  completedCount: number;
  waitingPatientsCount: number;
  activePatient?: {
    appointmentId: string;
    serialNumber: number;
    patientName: string;
    status: AppointmentStatus;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionSnapshot {
  institutionName: string;
  institutionLogo?: string;
  institutionAddress: string;
  institutionPhone: string;
  locationType: LocationType;
  chamberName: string;
  doctorName: string;
  doctorQualifications: string[];
  doctorSpecialization: string;
  doctorRegistration: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  doctorId: string;
  date: string;
  snapshot: PrescriptionSnapshot;
  vitals?: {
    bloodPressure?: string;
    pulse?: string;
    weight?: string;
    temperature?: string;
    spo2?: string;
  };
  symptoms: string[];
  diagnosis: string;
  advisedTests: string[];
  medicines: Medication[];
  adviceInstructions: string[];
  nextFollowUpDate?: string;
  status: 'draft' | 'issued';
  issuedAt?: string;
}

export interface DiagnosticTest {
  id: string;
  diagnosticCenterId: string;
  centerName: string;
  name: string;
  category: string;
  description: string;
  price: number;
  preparationInstructions: string;
  homeCollectionAvailable: boolean;
  sampleType: string;
  turnaroundTime: string;
  status: 'active' | 'inactive';
}

export type DiagnosticOrderStatus =
  | 'booked'
  | 'accepted'
  | 'sample_collected'
  | 'processing'
  | 'report_ready'
  | 'cancelled';

export interface DiagnosticOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress?: string;
  diagnosticCenterId: string;
  centerName: string;
  testId: string;
  testName: string;
  testPrice: number;
  bookingType: 'walk_in' | 'home_collection';
  scheduledDate: string;
  timeSlot: string;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: 'cash'; // CASH ONLY
  status: DiagnosticOrderStatus;
  sampleCollectorName?: string;
  reportUrl?: string;
  reportUploadedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface DiagnosticReport {
  id: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  diagnosticCenterId: string;
  centerName: string;
  centerLogo?: string;
  centerAddress: string;
  testName: string;
  testCategory: string;
  referredByDoctor?: string;
  collectionDate: string;
  deliveryDate: string;
  pdfUrl: string;
  technologistName: string;
  consultantName: string;
  status: 'ready' | 'pending';
}

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_changed'
  | 'appointment_reminder'
  | 'prescription_available'
  | 'report_ready'
  | 'order_status_updated'
  | 'new_booking_alert';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}
