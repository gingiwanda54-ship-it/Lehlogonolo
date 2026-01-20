
export type UserRole = 'PATIENT' | 'ADMIN' | 'NURSE';
export type MeetingPlatform = 'Google Meet' | 'MS Teams';
export type NurseCategory = 'Professional Nurse (RN)' | 'Staff Nurse (EN)' | 'Nursing Assistant (ENA)' | 'Nurse Practitioner (NP)';
export type NurseStatus = 'Available' | 'On a Call' | 'Offline';

export interface PaymentMethod {
  id: string;
  type: 'VISA' | 'MASTERCARD';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface SecurityConfig {
  mfaEnabled: boolean;
  biometricEnabled: boolean;
  encryptionLevel: 'AES-256-GCM';
  lastAudit: string;
  loginAlerts: boolean;
  autoTimeoutMinutes: number;
  privacyMode: boolean; // Blurs sensitive data by default
}

export interface User {
  id: string;
  patientId?: string; // KH-XXXX unique identifier
  email: string;
  firstName: string;
  surname: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  nurseId?: string;
  saIdNumber?: string;
  medicalAidName?: string;
  medicalAidNumber?: string;
  paymentMethods?: PaymentMethod[];
  security?: SecurityConfig;
}

export interface AppUpdate {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'FEATURE' | 'SECURITY' | 'MAINTENANCE';
  isNew: boolean;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

export interface LegalStatus {
  indemnitySigned: boolean;
  indemnityDate?: string;
  indemnitySignature?: string;
  popiaConsent: boolean;
  popiaDate?: string;
  popiaSignature?: string;
  dataSharingConsent: boolean;
  nhiComplianceStatus: 'Compliant' | 'Pending' | 'Exempt';
  identityVerified: boolean;
  telemedicineConsent: boolean;
  sharingPreferences: {
    labs: boolean;
    specialists: boolean;
    insurance: boolean;
    research: boolean;
    crossBorder: boolean;
  };
}

export interface HealthMetric {
  date: string;
  gfr: number;
  creatinine: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  potassium: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  doctor: string;
  doctorHpcsaNumber?: string;
  status: 'Complete' | 'Pending';
  description: string;
  fileType: 'Lab' | 'Dialysis' | 'Prescription' | 'Imaging';
}

export interface Testimonial {
  patientName: string;
  rating: number;
  comment: string;
}

export interface Nurse {
  id: string;
  name: string;
  sancNumber: string;
  nurseType: NurseCategory;
  specialty: string;
  img: string;
  active: boolean;
  status: NurseStatus;
  certifications: string[];
  languages: string[];
  testimonials: Testimonial[];
  availability: {
    [key: string]: string[]; 
  };
  blockedDates?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  nurseId: string;
  nurseName: string;
  date: string;
  time: string;
  type: string;
  consultationType: 'In-person' | 'Virtual';
  platform?: MeetingPlatform;
  videoRoomId?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;
}

export type NotificationType = 'APPOINTMENT' | 'RECORD' | 'HEALTH_ALERT' | 'SYSTEM' | 'SECURITY';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  categories: Record<NotificationType, boolean>;
  channels: {
    IN_APP: boolean;
    EMAIL: boolean;
    SMS: boolean;
  };
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  BOOKING = 'booking',
  RECORDS = 'records',
  PROGRESS = 'progress',
  TELEHEALTH = 'telehealth',
  REVIEWS = 'reviews',
  ADMIN_NURSES = 'admin_nurses',
  ADMIN_APPOINTMENTS = 'admin_appointments',
  ADMIN_PATIENTS = 'admin_patients',
  ADMIN_CALENDAR = 'admin_calendar',
  ADMIN_ANALYTICS = 'admin_analytics',
  VIDEO_CALL = 'video_call',
  NOTIFICATIONS = 'notifications',
  TRUST_CENTER = 'trust_center',
  UPDATES = 'updates',
  ONBOARDING = 'onboarding',
  NURSE_AVAILABILITY = 'nurse_availability',
  NURSE_SCHEDULE = 'nurse_schedule',
  NURSE_PATIENTS = 'nurse_patients'
}
