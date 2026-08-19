import {
  User,
  Doctor,
  Hospital,
  DiagnosticCenter,
  PracticeLocation,
  Staff,
  Appointment,
  DiagnosticTest,
  DiagnosticOrder,
  Prescription,
  AppNotification,
  AuditLog,
  QueueState,
} from '../../types';
import {
  mockUsers,
  mockDoctors,
  mockHospitals,
  mockDiagnosticCenters,
  mockPracticeLocations,
  mockStaff,
  mockAppointments,
  mockDiagnosticTests,
  mockDiagnosticOrders,
  mockPrescriptions,
  mockNotifications,
  mockAuditLogs,
} from './data';

// In-Memory store simulating backend database
let users = [...mockUsers];
let doctors = [...mockDoctors];
let hospitals = [...mockHospitals];
let diagnosticCenters = [...mockDiagnosticCenters];
let practiceLocations = [...mockPracticeLocations];
let staffMembers = [...mockStaff];
let appointments = [...mockAppointments];
let diagnosticTests = [...mockDiagnosticTests];
let diagnosticOrders = [...mockDiagnosticOrders];
let prescriptions = [...mockPrescriptions];
let notifications = [...mockNotifications];
let auditLogs = [...mockAuditLogs];

// Simulated network latency
export const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDb = {
  // Current session simulation
  currentUser: users[0], // default: patient
  setCurrentUser: (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      mockDb.currentUser = user;
      localStorage.setItem('medify_current_user_id', user.id);
    }
  },
  getCurrentUser: (): User => {
    const savedId = localStorage.getItem('medify_current_user_id');
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    return mockDb.currentUser;
  },

  // Doctors
  getDoctors: async (filters?: { specialization?: string; location?: string; search?: string }) => {
    await delay();
    let result = [...doctors];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.practiceLocations.some(
            (loc) => loc.institutionName.toLowerCase().includes(q) || loc.chamberName.toLowerCase().includes(q)
          )
      );
    }
    if (filters?.specialization) {
      result = result.filter((d) => d.specialization.toLowerCase() === filters.specialization?.toLowerCase());
    }
    if (filters?.location) {
      const locQ = filters.location.toLowerCase();
      result = result.filter((d) =>
        d.practiceLocations.some((loc) => loc.city.toLowerCase().includes(locQ) || loc.address.toLowerCase().includes(locQ))
      );
    }
    return result;
  },

  getDoctorById: async (id: string) => {
    await delay();
    return doctors.find((d) => d.id === id || d.userId === id);
  },

  createDoctor: async (newDoc: Partial<Doctor>) => {
    await delay();
    const docId = `DOC-${String(doctors.length + 1).padStart(3, '0')}`;
    const userId = `USR-DOC-${String(doctors.length + 1).padStart(3, '0')}`;

    const doctor: Doctor = {
      id: docId,
      userId: userId,
      name: newDoc.name || 'New Doctor',
      email: newDoc.email || `${docId.toLowerCase()}@medify247.com`,
      phone: newDoc.phone || '+880 1700 000000',
      photoUrl: newDoc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      specialization: newDoc.specialization || 'General Physician',
      qualifications: newDoc.qualifications || ['MBBS'],
      experienceYears: newDoc.experienceYears || 5,
      registrationNumber: newDoc.registrationNumber || `BMDC Reg #A-${Math.floor(10000 + Math.random() * 90000)}`,
      isVerified: true,
      about: newDoc.about || 'Specialist doctor committed to delivering quality patient care.',
      practiceLocations: newDoc.practiceLocations || [],
    };

    doctors.push(doctor);
    users.push({
      id: userId,
      email: doctor.email,
      name: doctor.name,
      phone: doctor.phone,
      role: 'doctor',
      doctorId: docId,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    });

    return doctor;
  },

  // Practice Locations
  addPracticeLocation: async (doctorId: string, locData: Partial<PracticeLocation>) => {
    await delay();
    const doc = doctors.find((d) => d.id === doctorId);
    if (!doc) throw new Error('Doctor not found');

    const newLoc: PracticeLocation = {
      id: `LOC-${String(practiceLocations.length + 1).padStart(3, '0')}`,
      doctorId: doctorId,
      institutionId: locData.institutionId,
      institutionName: locData.institutionName || 'Private Chamber',
      locationType: locData.locationType || 'individual_chamber',
      chamberName: locData.chamberName || 'Room 101',
      address: locData.address || 'Dhaka',
      city: locData.city || 'Dhaka',
      phone: locData.phone || doc.phone,
      consultationFee: locData.consultationFee || 500,
      scheduleDays: locData.scheduleDays || ['Saturday', 'Sunday'],
      startTime: locData.startTime || '17:00',
      endTime: locData.endTime || '21:00',
      dailyPatientLimit: locData.dailyPatientLimit || 20,
      status: 'active',
      photos: locData.photos || [],
    };

    practiceLocations.push(newLoc);
    doc.practiceLocations.push(newLoc);
    return newLoc;
  },

  // Hospitals
  getHospitals: async () => {
    await delay();
    return [...hospitals];
  },

  getHospitalById: async (id: string) => {
    await delay();
    return hospitals.find((h) => h.id === id);
  },

  createHospital: async (data: Partial<Hospital>) => {
    await delay();
    const id = `HOSP-${String(hospitals.length + 1).padStart(3, '0')}`;
    const newHosp: Hospital = {
      id,
      userId: `USR-HOSP-${String(hospitals.length + 1).padStart(3, '0')}`,
      name: data.name || 'New Hospital',
      registrationNumber: data.registrationNumber || `DGHS-HOSP-${Math.floor(10000 + Math.random() * 90000)}`,
      email: data.email || 'info@hospital.com',
      phone: data.phone || '+880 2 0000000',
      address: data.address || 'Dhaka',
      city: data.city || 'Dhaka',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80',
      photos: [],
      status: 'approved',
      departments: data.departments || ['General Medicine'],
      totalChambers: data.totalChambers || 10,
      doctorCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    hospitals.push(newHosp);
    return newHosp;
  },

  // Diagnostic Centers
  getDiagnosticCenters: async () => {
    await delay();
    return [...diagnosticCenters];
  },

  getDiagnosticCenterById: async (id: string) => {
    await delay();
    return diagnosticCenters.find((c) => c.id === id);
  },

  createDiagnosticCenter: async (data: Partial<DiagnosticCenter>) => {
    await delay();
    const id = `DIAG-${String(diagnosticCenters.length + 1).padStart(3, '0')}`;
    const newCenter: DiagnosticCenter = {
      id,
      userId: `USR-DIAG-${String(diagnosticCenters.length + 1).padStart(3, '0')}`,
      name: data.name || 'New Diagnostic Center',
      registrationNumber: data.registrationNumber || `DGHS-DIAG-${Math.floor(10000 + Math.random() * 90000)}`,
      email: data.email || 'info@diagnostic.com',
      phone: data.phone || '+880 2 0000000',
      address: data.address || 'Dhaka',
      city: data.city || 'Dhaka',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
      photos: [],
      status: 'approved',
      offersHomeCollection: data.offersHomeCollection ?? true,
      testCount: 0,
      doctorCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    diagnosticCenters.push(newCenter);
    return newCenter;
  },

  // Appointments & Serial Booking with Double Booking Prevention
  getAppointments: async (params?: {
    patientId?: string;
    doctorId?: string;
    institutionId?: string;
    practiceLocationId?: string;
    date?: string;
    status?: string;
  }) => {
    await delay();
    let res = [...appointments];
    if (params?.patientId) res = res.filter((a) => a.patientId === params.patientId);
    if (params?.doctorId) res = res.filter((a) => a.doctorId === params.doctorId);
    if (params?.institutionId) res = res.filter((a) => a.institutionId === params.institutionId);
    if (params?.practiceLocationId) res = res.filter((a) => a.practiceLocationId === params.practiceLocationId);
    if (params?.date) res = res.filter((a) => a.appointmentDate === params.date);
    if (params?.status) res = res.filter((a) => a.status === params.status);
    return res;
  },

  getAppointmentById: async (id: string) => {
    await delay();
    return appointments.find((a) => a.id === id);
  },

  getNextAvailableSerial: (practiceLocationId: string, date: string): number => {
    const existing = appointments.filter(
      (a) => a.practiceLocationId === practiceLocationId && a.appointmentDate === date && a.status !== 'cancelled'
    );
    return existing.length + 1;
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
    await delay(350);

    const doc = doctors.find((d) => d.id === bookingData.doctorId);
    if (!doc) throw new Error('Doctor not found');

    const loc = doc.practiceLocations.find((l) => l.id === bookingData.practiceLocationId);
    if (!loc) throw new Error('Practice location not found');

    // Conflict Check: Double-booking simulation
    const existingAppointments = appointments.filter(
      (a) =>
        a.practiceLocationId === loc.id &&
        a.appointmentDate === bookingData.appointmentDate &&
        a.status !== 'cancelled'
    );

    const targetSerial = bookingData.desiredSerial || existingAppointments.length + 1;

    // Check if serial is already booked
    const isConflict = existingAppointments.some((a) => a.serialNumber === targetSerial);
    if (isConflict) {
      const error = new Error('This serial was just booked by another patient. Please choose another serial.');
      (error as any).code = 'BOOKING_CONFLICT';
      throw error;
    }

    if (existingAppointments.length >= loc.dailyPatientLimit) {
      throw new Error('Daily patient limit reached for this date. Please choose another day.');
    }

    const newApt: Appointment = {
      id: `APT-2026-${String(appointments.length + 1).padStart(3, '0')}`,
      patientId: bookingData.patientId,
      patientName: bookingData.patientName,
      patientPhone: bookingData.patientPhone,
      patientAge: bookingData.patientAge || 30,
      patientGender: bookingData.patientGender || 'male',
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      practiceLocationId: loc.id,
      institutionId: loc.institutionId,
      institutionName: loc.institutionName,
      locationType: loc.locationType,
      chamberName: loc.chamberName,
      address: loc.address,
      appointmentDate: bookingData.appointmentDate,
      serialNumber: targetSerial,
      estimatedTime: `${loc.startTime.split(':')[0]}:${String(parseInt(loc.startTime.split(':')[1] || '0', 10) + (targetSerial - 1) * 12).padStart(2, '0')}`,
      consultationFee: loc.consultationFee,
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      status: 'booked',
      notes: bookingData.notes,
      createdAt: new Date().toISOString(),
    };

    appointments.push(newApt);
    return newApt;
  },

  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']) => {
    await delay();
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');
    apt.status = status;
    return apt;
  },

  recordAppointmentCashPayment: async (appointmentId: string) => {
    await delay();
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');
    apt.paymentStatus = 'paid';
    return apt;
  },

  // Queue Live State
  getQueueState: async (practiceLocationId: string, date: string): Promise<QueueState> => {
    await delay();
    const loc = practiceLocations.find((l) => l.id === practiceLocationId);
    const doc = loc ? doctors.find((d) => d.id === loc.doctorId) : null;
    const locAppointments = appointments.filter(
      (a) => a.practiceLocationId === practiceLocationId && a.appointmentDate === date && a.status !== 'cancelled'
    );

    const checkedIn = locAppointments.filter((a) => a.status === 'checked_in').length;
    const completed = locAppointments.filter((a) => a.status === 'completed').length;
    const inConsultation = locAppointments.find((a) => a.status === 'in_consultation');
    const waiting = locAppointments.filter((a) => ['checked_in', 'waiting', 'booked'].includes(a.status)).length;

    return {
      practiceLocationId,
      doctorId: doc?.id || '',
      doctorName: doc?.name || '',
      institutionName: loc?.institutionName || '',
      chamberName: loc?.chamberName || '',
      date,
      totalBooked: locAppointments.length,
      currentSerialServing: inConsultation ? inConsultation.serialNumber : completed + 1,
      checkedInCount: checkedIn,
      completedCount: completed,
      waitingPatientsCount: waiting,
      activePatient: inConsultation
        ? {
            appointmentId: inConsultation.id,
            serialNumber: inConsultation.serialNumber,
            patientName: inConsultation.patientName,
            status: inConsultation.status,
          }
        : undefined,
    };
  },

  // Prescriptions
  getPrescriptions: async (params?: { patientId?: string; doctorId?: string }) => {
    await delay();
    let res = [...prescriptions];
    if (params?.patientId) res = res.filter((p) => p.patientId === params.patientId);
    if (params?.doctorId) res = res.filter((p) => p.doctorId === params.doctorId);
    return res;
  },

  getPrescriptionById: async (id: string) => {
    await delay();
    return prescriptions.find((p) => p.id === id);
  },

  createPrescription: async (data: Partial<Prescription> & { appointmentId: string }) => {
    await delay();
    const apt = appointments.find((a) => a.id === data.appointmentId);
    if (!apt) throw new Error('Associated appointment not found');

    const doc = doctors.find((d) => d.id === apt.doctorId);
    const loc = practiceLocations.find((l) => l.id === apt.practiceLocationId);

    const newPrescription: Prescription = {
      id: `RX-2026-${String(prescriptions.length + 1).padStart(3, '0')}`,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientAge: apt.patientAge || 30,
      patientGender: apt.patientGender || 'male',
      doctorId: apt.doctorId,
      date: new Date().toISOString().split('T')[0],
      snapshot: {
        institutionName: apt.institutionName,
        institutionLogo:
          apt.locationType === 'hospital'
            ? 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80'
            : apt.locationType === 'diagnostic_center'
            ? 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80'
            : undefined,
        institutionAddress: apt.address,
        institutionPhone: loc?.phone || '+880 2 0000000',
        locationType: apt.locationType,
        chamberName: apt.chamberName,
        doctorName: doc?.name || apt.doctorName,
        doctorQualifications: doc?.qualifications || ['MBBS'],
        doctorSpecialization: doc?.specialization || 'Consultant Physician',
        doctorRegistration: doc?.registrationNumber || 'BMDC Reg #A-1000',
      },
      vitals: data.vitals,
      symptoms: data.symptoms || [],
      diagnosis: data.diagnosis || 'Clinical evaluation and general symptomatic treatment.',
      advisedTests: data.advisedTests || [],
      medicines: data.medicines || [],
      adviceInstructions: data.adviceInstructions || [],
      nextFollowUpDate: data.nextFollowUpDate,
      status: 'issued',
      issuedAt: new Date().toISOString(),
    };

    prescriptions.push(newPrescription);
    apt.hasPrescription = true;
    apt.prescriptionId = newPrescription.id;
    apt.status = 'completed';

    // Add notification for patient
    notifications.push({
      id: `NOTIF-${Date.now()}`,
      userId: `USR-${apt.patientId}`,
      title: 'New Prescription Issued',
      message: `Dr. ${apt.doctorName} has issued your digital prescription.`,
      type: 'prescription_available',
      read: false,
      linkUrl: `/patient/prescriptions/${newPrescription.id}`,
      createdAt: new Date().toISOString(),
    });

    return newPrescription;
  },

  // Diagnostic Tests
  getDiagnosticTests: async (filters?: { centerId?: string; search?: string }) => {
    await delay();
    let res = [...diagnosticTests];
    if (filters?.centerId) res = res.filter((t) => t.diagnosticCenterId === filters.centerId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      res = res.filter((t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return res;
  },

  createDiagnosticTest: async (data: Partial<DiagnosticTest>) => {
    await delay();
    const id = `TEST-${String(diagnosticTests.length + 1).padStart(3, '0')}`;
    const newTest: DiagnosticTest = {
      id,
      diagnosticCenterId: data.diagnosticCenterId || 'DIAG-001',
      centerName: data.centerName || 'Lab Aid Diagnostic Center',
      name: data.name || 'New Diagnostic Test',
      category: data.category || 'General Pathology',
      description: data.description || 'Standard pathology assessment.',
      price: data.price || 500,
      preparationInstructions: data.preparationInstructions || 'No specific preparation required.',
      homeCollectionAvailable: data.homeCollectionAvailable ?? true,
      sampleType: data.sampleType || 'Blood',
      turnaroundTime: data.turnaroundTime || '24 Hours',
      status: 'active',
    };
    diagnosticTests.push(newTest);
    return newTest;
  },

  // Diagnostic Orders
  getDiagnosticOrders: async (filters?: { patientId?: string; centerId?: string; status?: string }) => {
    await delay();
    let res = [...diagnosticOrders];
    if (filters?.patientId) res = res.filter((o) => o.patientId === filters.patientId);
    if (filters?.centerId) res = res.filter((o) => o.diagnosticCenterId === filters.centerId);
    if (filters?.status) res = res.filter((o) => o.status === filters.status);
    return res;
  },

  createDiagnosticOrder: async (data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientAddress?: string;
    diagnosticCenterId: string;
    testId: string;
    bookingType: 'walk_in' | 'home_collection';
    scheduledDate: string;
    timeSlot: string;
  }) => {
    await delay();
    const test = diagnosticTests.find((t) => t.id === data.testId);
    const center = diagnosticCenters.find((c) => c.id === data.diagnosticCenterId);

    const newOrder: DiagnosticOrder = {
      id: `ORD-2026-${String(diagnosticOrders.length + 1).padStart(3, '0')}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientAddress: data.patientAddress,
      diagnosticCenterId: data.diagnosticCenterId,
      centerName: center?.name || test?.centerName || 'Diagnostic Center',
      testId: data.testId,
      testName: test?.name || 'Diagnostic Test',
      testPrice: test?.price || 500,
      bookingType: data.bookingType,
      scheduledDate: data.scheduledDate,
      timeSlot: data.timeSlot,
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      status: 'booked',
      createdAt: new Date().toISOString(),
    };

    diagnosticOrders.push(newOrder);
    return newOrder;
  },

  updateDiagnosticOrderStatus: async (orderId: string, status: DiagnosticOrder['status'], reportUrl?: string) => {
    await delay();
    const order = diagnosticOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    if (reportUrl) {
      order.reportUrl = reportUrl;
      order.reportUploadedAt = new Date().toISOString();
    }
    return order;
  },

  // Staff
  getStaff: async (filters?: { institutionId?: string; assignedDoctorId?: string }) => {
    await delay();
    let res = [...staffMembers];
    if (filters?.institutionId) res = res.filter((s) => s.institutionId === filters.institutionId);
    if (filters?.assignedDoctorId) res = res.filter((s) => s.assignedDoctorId === filters.assignedDoctorId);
    return res;
  },

  createStaff: async (data: Partial<Staff>) => {
    await delay();
    const id = `STF-${String(staffMembers.length + 1).padStart(3, '0')}`;
    const newStaff: Staff = {
      id,
      userId: `USR-${id}`,
      name: data.name || 'New Staff',
      email: data.email || 'staff@medify247.com',
      phone: data.phone || '+880 1700 000000',
      role: data.role || 'hospital_staff',
      designation: data.designation || 'Assistant',
      institutionId: data.institutionId,
      institutionName: data.institutionName,
      assignedDoctorId: data.assignedDoctorId,
      assignedDoctorName: data.assignedDoctorName,
      status: 'active',
    };
    staffMembers.push(newStaff);
    return newStaff;
  },

  // Notifications
  getNotifications: async (userId: string) => {
    await delay();
    return notifications.filter((n) => n.userId === userId || n.userId === `USR-${userId}`);
  },

  markNotificationRead: async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    return notif;
  },

  // Audit Logs
  getAuditLogs: async () => {
    await delay();
    return [...auditLogs];
  },
};
