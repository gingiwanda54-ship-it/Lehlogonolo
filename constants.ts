
import { HealthMetric, MedicalRecord, Appointment, Nurse, AppNotification, AppUpdate, FeatureFlag } from './types';

export const COLORS = {
  primary: '#5B21B6', 
  secondary: '#10B981', 
  accent: '#F59E0B',
  danger: '#EF4444',
  bg: '#F9FAFB'
};

export const MOCK_UPDATES: AppUpdate[] = [
  {
    id: 'u1',
    version: '2.4.0',
    date: '2024-05-15',
    title: 'Biometric Security 2.0',
    description: 'Enhanced FaceID and TouchID integration for lightning-fast access to renal records.',
    type: 'SECURITY',
    isNew: true
  },
  {
    id: 'u2',
    version: '2.3.5',
    date: '2024-05-01',
    title: 'Smart Lab Predictions',
    description: 'Our AI now predicts potential electrolyte imbalances before they show up on your tests.',
    type: 'FEATURE',
    isNew: false
  },
  {
    id: 'u3',
    version: '2.3.0',
    date: '2024-04-10',
    title: 'PAIA Section 13 Portal',
    description: 'Fully automated medical records request system compliant with the PAIA Act.',
    type: 'MAINTENANCE',
    isNew: false
  }
];

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'f1', name: 'AI Renal Assistant', description: 'Enable natural language health queries.', isEnabled: true },
  { id: 'f2', name: 'Live Dialysis Stream', description: 'Real-time telemetry from dialysis machines.', isEnabled: false },
  { id: 'f3', name: 'Family Share', description: 'Allow specific family members to view metrics.', isEnabled: true },
  { id: 'f4', name: 'Dark Mode', description: 'High contrast UI for night-time use.', isEnabled: true }
];

export const SA_MEDICAL_AIDS = [
  "Discovery Health",
  "Bonitas Medical Fund",
  "Momentum Health",
  "Bestmed Medical Scheme",
  "Medihelp",
  "Medshield",
  "Fedhealth",
  "GEMS (Government Employees Medical Scheme)",
  "Bankmed",
  "Profmed",
  "Sizwe Hosmed",
  "KeyHealth",
  "Cash / Self-Pay"
];

export const MOCK_METRICS: HealthMetric[] = [
  { date: '2023-10-01', gfr: 85, creatinine: 1.1, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, potassium: 4.2 },
  { date: '2023-11-01', gfr: 82, creatinine: 1.2, bloodPressureSystolic: 125, bloodPressureDiastolic: 82, potassium: 4.5 },
  { date: '2023-12-01', gfr: 88, creatinine: 1.0, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, potassium: 4.1 },
  { date: '2024-01-01', gfr: 90, creatinine: 0.9, bloodPressureSystolic: 115, bloodPressureDiastolic: 75, potassium: 4.0 },
  { date: '2024-02-01', gfr: 87, creatinine: 1.1, bloodPressureSystolic: 122, bloodPressureDiastolic: 80, potassium: 4.3 },
];

export const MOCK_NURSES: Nurse[] = [
  { 
    id: 'n1', 
    name: 'Nurse Sarah Miller', 
    sancNumber: 'SANC-782291',
    nurseType: 'Professional Nurse (RN)',
    specialty: 'Dialysis Specialist', 
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    active: true,
    status: 'Available',
    certifications: ['Certified Dialysis Nurse (CDN)', 'Advanced Cardiac Life Support (ACLS)', 'HPCSA Registered'],
    languages: ['English', 'Afrikaans', 'isiXhosa'],
    testimonials: [
      { patientName: 'Robert K.', rating: 5, comment: 'Sarah is incredibly gentle during my dialysis sessions. She really knows her stuff!' },
      { patientName: 'Sipho M.', rating: 5, comment: 'Always on time and very professional.' }
    ],
    availability: { '2024-05-20': ['09:00 AM', '11:00 AM', '02:00 PM'], '2024-05-21': ['10:00 AM'] }
  },
  { 
    id: 'n2', 
    name: 'Nurse James Lee', 
    sancNumber: 'SANC-661023',
    nurseType: 'Nurse Practitioner (NP)',
    specialty: 'Patient Educator', 
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    active: true,
    status: 'On a Call',
    certifications: ['Certified Clinical Nurse Educator', 'Chronic Kidney Disease Care Certification'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    testimonials: [
      { patientName: 'Alice W.', rating: 5, comment: 'James explained my renal diet in a way I actually understood. A life saver!' }
    ],
    availability: { '2024-05-20': ['10:00 AM', '01:00 PM'], '2024-05-22': ['09:00 AM'] }
  },
  { 
    id: 'n3', 
    name: 'Nurse Emily Chen', 
    sancNumber: 'SANC-554102',
    nurseType: 'Staff Nurse (EN)',
    specialty: 'Care Coordinator', 
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
    active: true,
    status: 'Available',
    certifications: ['Case Management Administrator (CCMA)', 'Renal Social Work Associate'],
    languages: ['English', 'isiZulu', 'Sotho'],
    testimonials: [
      { patientName: 'David L.', rating: 5, comment: 'Emily makes sure all my doctors are on the same page. She takes the stress out of appointments.' }
    ],
    availability: { '2024-05-20': ['09:30 AM', '03:00 PM'] }
  }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  { id: '1', patientId: 'p1', date: '2024-02-15', title: 'Kidney Function Panel', doctor: 'Dr. Sarah Smith', status: 'Complete', description: 'Stable GFR and creatinine levels.', fileType: 'Lab' },
  { id: '2', patientId: 'p1', date: '2024-01-10', title: 'Monthly Dialysis Summary', doctor: 'Dr. James Wilson', status: 'Complete', description: 'Treatment tolerated well.', fileType: 'Dialysis' },
  { id: '3', patientId: 'p1', date: '2023-11-20', title: 'Renal Diet Plan', doctor: 'Nutritionist Maria', status: 'Complete', description: 'Updated potassium limits.', fileType: 'Prescription' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: '101', 
    patientId: 'p1', 
    patientName: 'John Doe', 
    nurseId: 'n1', 
    nurseName: 'Sarah Miller', 
    date: '2024-05-20', 
    time: '10:00 AM', 
    type: 'Consultation', 
    consultationType: 'Virtual', 
    platform: 'Google Meet',
    videoRoomId: 'abc-defg-hij', 
    status: 'Upcoming' 
  },
  { 
    id: '102', 
    patientId: 'p1', 
    patientName: 'John Doe', 
    nurseId: 'n2', 
    nurseName: 'James Lee', 
    date: '2024-06-15', 
    time: '02:30 PM', 
    type: 'Dialysis Check', 
    consultationType: 'In-person', 
    status: 'Upcoming' 
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'nt1',
    type: 'APPOINTMENT',
    title: 'Upcoming Appointment',
    message: 'Your virtual consultation with Nurse Sarah Miller is starting in 30 minutes.',
    timestamp: '2024-05-20T09:30:00Z',
    read: false,
    actionUrl: 'video_call'
  },
  {
    id: 'nt2',
    type: 'RECORD',
    title: 'New Lab Result Shared',
    message: 'A new Kidney Function Panel report has been uploaded by Dr. Sarah Smith.',
    timestamp: '2024-05-18T14:20:00Z',
    read: true,
    actionUrl: 'records'
  },
  {
    id: 'nt3',
    type: 'HEALTH_ALERT',
    title: 'Health Trend Detected',
    message: 'Significant improvement in your eGFR levels detected over the last 30 days. Keep up the great work!',
    timestamp: '2024-05-15T10:00:00Z',
    read: false,
    actionUrl: 'progress'
  }
];

export const MOCK_NURSE_STATS = [
  { name: 'Sarah Miller', appointments: 124, avgDuration: 42, satisfaction: 4.9, completionRate: 98 },
  { name: 'James Lee', appointments: 98, avgDuration: 35, satisfaction: 4.7, completionRate: 95 },
  { name: 'Emily Chen', appointments: 110, avgDuration: 38, satisfaction: 4.8, completionRate: 97 },
  { name: 'David Wilson', appointments: 85, avgDuration: 45, satisfaction: 4.6, completionRate: 92 },
  { name: 'Maria Garcia', appointments: 142, avgDuration: 30, satisfaction: 4.9, completionRate: 99 },
];
