// ============================================================
// Presentify ERP — Mock Data Layer (Phase 1)
// All data is hardcoded to simulate a real database.
// ============================================================

// ------- User Accounts -------

export const MOCK_USERS = {
  student: {
    role: 'student' as const,
    id: 'STU202601',
    name: 'Arjun Sharma',
    rollNo: 'STU202601',
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    semester: 4,
    batch: '2026',
    section: 'A',
    email: 'arjun.sharma@presentify.edu.in',
    phone: '+91 98765 43210',
    dob: '2004-07-15',
    bloodGroup: 'B+',
    address: '42, Residency Road, Navrangpura, Ahmedabad, Gujarat — 380009',
    faceId: 'FX-99211',
    enrollmentStatus: 'Active',
    attendancePercentage: 82,
    admissionYear: 2022,
  },
  teacher: {
    role: 'teacher' as const,
    id: 'FAC202699',
    name: 'Dr. Priya Mehta',
    facultyId: 'FAC202699',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'priya.mehta@presentify.edu.in',
    phone: '+91 98765 00123',
    cabinNo: 'CS-204, Block B',
    joiningYear: 2018,
    qualifications: [
      'Ph.D. — Computer Science, IIT Bombay (2018)',
      'M.Tech — Information Technology, NIT Surat (2013)',
      'B.E. — Computer Engineering, Gujarat University (2011)',
    ],
    assignedSubjects: [
      { code: 'CS401', name: 'Advanced Web Development', semester: 4, batch: '2026' },
      { code: 'CS402', name: 'Database Management Systems', semester: 4, batch: '2026' },
      { code: 'CS201', name: 'Data Structures', semester: 2, batch: '2028' },
    ],
    assignedClasses: [
      { id: 'CSE-4A', label: 'CSE Sem 4 — Section A', strength: 62 },
      { id: 'CSE-4B', label: 'CSE Sem 4 — Section B', strength: 58 },
      { id: 'CSE-2A', label: 'CSE Sem 2 — Section A', strength: 60 },
    ],
  },
};

// ------- Fee Data -------

export const MOCK_FEES = {
  STU202601: {
    semester: 4,
    academicYear: '2025-26',
    dueDate: '2026-06-30',
    receiptPrefix: 'PRES',
    items: [
      { id: 'FEE001', label: 'Tuition Fee', amount: 45000, paid: false },
      { id: 'FEE002', label: 'Examination Fee', amount: 3500, paid: false },
      { id: 'FEE003', label: 'Laboratory Fee', amount: 6000, paid: false },
      { id: 'FEE004', label: 'Amenities & Infrastructure', amount: 2500, paid: false },
    ],
  },
};

// ------- Subjects (Sem 4) -------

export const MOCK_SUBJECTS_SEM4 = [
  { code: 'CS401', name: 'Advanced Web Development', credits: 4, type: 'Core' },
  { code: 'CS402', name: 'Database Management Systems', credits: 4, type: 'Core' },
  { code: 'CS403', name: 'Operating Systems', credits: 4, type: 'Core' },
  { code: 'CS404', name: 'Computer Networks', credits: 3, type: 'Core' },
  { code: 'CS405', name: 'Software Engineering', credits: 3, type: 'Elective' },
];

// ------- Mock Student List for Teacher's Marks Entry -------

export const MOCK_STUDENTS_SEM4 = [
  { rollNo: 'STU202601', name: 'Arjun Sharma', section: 'A' },
  { rollNo: 'STU202602', name: 'Priya Desai', section: 'A' },
  { rollNo: 'STU202603', name: 'Rohan Patel', section: 'A' },
  { rollNo: 'STU202604', name: 'Sneha Joshi', section: 'A' },
  { rollNo: 'STU202605', name: 'Vikram Singh', section: 'A' },
];

// Pre-filled marks for non-demo students (display-only)
export const MOCK_PREFILLED_MARKS: Record<string, Record<string, { internal: number; external: number }>> = {
  STU202602: {
    CS401: { internal: 26, external: 61 },
    CS402: { internal: 24, external: 57 },
    CS403: { internal: 25, external: 59 },
    CS404: { internal: 22, external: 51 },
    CS405: { internal: 27, external: 63 },
  },
  STU202603: {
    CS401: { internal: 28, external: 66 },
    CS402: { internal: 27, external: 63 },
    CS403: { internal: 26, external: 60 },
    CS404: { internal: 25, external: 58 },
    CS405: { internal: 29, external: 67 },
  },
  STU202604: {
    CS401: { internal: 23, external: 52 },
    CS402: { internal: 21, external: 48 },
    CS403: { internal: 20, external: 45 },
    CS404: { internal: 19, external: 44 },
    CS405: { internal: 22, external: 50 },
  },
  STU202605: {
    CS401: { internal: 25, external: 58 },
    CS402: { internal: 26, external: 60 },
    CS403: { internal: 24, external: 55 },
    CS404: { internal: 23, external: 53 },
    CS405: { internal: 25, external: 58 },
  },
};

// ------- Marks (Arjun Sharma — Demo Student) -------

export const MOCK_MARKS_INITIAL = {
  STU202601: {
    sem4: {
      published: false,
      subjects: {
        CS401: { internal: null as number | null, external: null as number | null },
        CS402: { internal: null as number | null, external: null as number | null },
        CS403: { internal: null as number | null, external: null as number | null },
        CS404: { internal: null as number | null, external: null as number | null },
        CS405: { internal: null as number | null, external: null as number | null },
      },
    },
    // Historical semesters (published)
    historicalSemesters: [
      {
        sem: 1,
        spi: 8.2,
        subjects: [
          { code: 'CS101', name: 'Engineering Mathematics I', credits: 4, internal: 24, external: 55 },
          { code: 'CS102', name: 'Programming Fundamentals', credits: 4, internal: 25, external: 57 },
          { code: 'CS103', name: 'Digital Electronics', credits: 4, internal: 22, external: 52 },
          { code: 'CS104', name: 'English Communication', credits: 2, internal: 23, external: 55 },
          { code: 'CS105', name: 'Engineering Physics', credits: 3, internal: 21, external: 50 },
        ],
      },
      {
        sem: 2,
        spi: 8.5,
        subjects: [
          { code: 'CS201', name: 'Engineering Mathematics II', credits: 4, internal: 22, external: 53 },
          { code: 'CS202', name: 'Data Structures', credits: 4, internal: 24, external: 59 },
          { code: 'CS203', name: 'Computer Organization', credits: 4, internal: 22, external: 54 },
          { code: 'CS204', name: 'Discrete Mathematics', credits: 3, internal: 23, external: 57 },
          { code: 'CS205', name: 'Environmental Science', credits: 2, internal: 24, external: 58 },
        ],
      },
      {
        sem: 3,
        spi: 8.1,
        subjects: [
          { code: 'CS301', name: 'Algorithms & Complexity', credits: 4, internal: 24, external: 56 },
          { code: 'CS302', name: 'Object Oriented Programming', credits: 4, internal: 25, external: 58 },
          { code: 'CS303', name: 'Computer Architecture', credits: 3, internal: 23, external: 53 },
          { code: 'CS304', name: 'Probability & Statistics', credits: 3, internal: 22, external: 52 },
          { code: 'CS305', name: 'Micro Processors', credits: 3, internal: 21, external: 49 },
        ],
      },
    ],
  },
};

// ------- Attendance -------

export const MOCK_ATTENDANCE = {
  STU202601: {
    overall: 82,
    subjects: [
      { code: 'CS401', name: 'Advanced Web Development', conducted: 45, attended: 39, percentage: 86.7 },
      { code: 'CS402', name: 'Database Management Systems', conducted: 42, attended: 35, percentage: 83.3 },
      { code: 'CS403', name: 'Operating Systems', conducted: 40, attended: 31, percentage: 77.5 },
      { code: 'CS404', name: 'Computer Networks', conducted: 38, attended: 28, percentage: 73.7 },
      { code: 'CS405', name: 'Software Engineering', conducted: 35, attended: 30, percentage: 85.7 },
    ],
    faceAttendanceLog: [
      { date: '2026-05-28', time: '09:02 AM', subject: 'CS401', status: 'Present', confidence: 98.2 },
      { date: '2026-05-27', time: '11:05 AM', subject: 'CS402', status: 'Present', confidence: 97.8 },
      { date: '2026-05-26', time: '09:01 AM', subject: 'CS403', status: 'Present', confidence: 99.1 },
      { date: '2026-05-24', time: '02:03 PM', subject: 'CS404', status: 'Absent', confidence: 0 },
      { date: '2026-05-23', time: '09:00 AM', subject: 'CS401', status: 'Present', confidence: 97.5 },
      { date: '2026-05-22', time: '11:02 AM', subject: 'CS405', status: 'Present', confidence: 96.9 },
    ],
  },
};

// ------- Exam Schedule -------

export const MOCK_EXAM_SCHEDULE = [
  { code: 'CS401', name: 'Advanced Web Development', date: '2026-06-10', time: '10:00 AM', room: 'Block-A, Hall 3', seat: 'A-23', duration: '3 Hours' },
  { code: 'CS402', name: 'Database Management Systems', date: '2026-06-12', time: '10:00 AM', room: 'Block-A, Hall 3', seat: 'A-23', duration: '3 Hours' },
  { code: 'CS403', name: 'Operating Systems', date: '2026-06-14', time: '10:00 AM', room: 'Block-A, Hall 3', seat: 'A-23', duration: '3 Hours' },
  { code: 'CS404', name: 'Computer Networks', date: '2026-06-16', time: '02:00 PM', room: 'Block-B, Hall 1', seat: 'B-07', duration: '3 Hours' },
  { code: 'CS405', name: 'Software Engineering', date: '2026-06-18', time: '10:00 AM', room: 'Block-A, Hall 3', seat: 'A-23', duration: '3 Hours' },
];

// ------- Google Classroom Courses -------

export const MOCK_CLASSROOMS = [
  {
    id: 'CLS001',
    code: 'AWD-S4-2026',
    name: 'Advanced Web Development',
    section: 'CSE Sem 4 — Batch 2026',
    colorClass: 'from-blue-600 to-indigo-700',
    colorHex: '#4F46E5',
    teacher: 'Dr. Priya Mehta',
    students: 62,
    announcements: [
      {
        id: 'ANN001',
        date: '2026-05-27',
        title: 'Unit 5 Assignment Deadline Extended',
        body: 'The deadline for the React portfolio project (Unit 5) has been extended to June 5, 2026. Ensure proper component documentation, README, and deployment link are included.',
        attachments: [],
      },
      {
        id: 'ANN002',
        date: '2026-05-24',
        title: 'Mid-Term Assessment Results Published',
        body: 'Internal mid-term assessment marks are now live on the Presentify portal under Report Card. The average score was 24.6/30. Feedback sessions will be scheduled next week.',
        attachments: [{ name: 'Mid-Term-Rubric.pdf', type: 'pdf', size: '248 KB' }],
      },
      {
        id: 'ANN003',
        date: '2026-05-20',
        title: 'Guest Lecture: Microservices Architecture',
        body: 'Mr. Rahul Bose (Senior SDE, Flipkart) will conduct a special session on Microservices & API Gateway patterns on May 22 at 2:00 PM in Seminar Hall B. Attendance is mandatory.',
        attachments: [],
      },
    ],
    resources: [
      { id: 'RES001', name: 'Unit 4 — Next.js 14 Deep Dive.pdf', type: 'pdf', size: '3.2 MB', uploaded: '2026-05-15' },
      { id: 'RES002', name: 'React Hooks Reference Sheet.pdf', type: 'pdf', size: '890 KB', uploaded: '2026-05-10' },
      { id: 'RES003', name: 'Lab-Exercise-Set-3.zip', type: 'zip', size: '12.4 MB', uploaded: '2026-05-08' },
      { id: 'RES004', name: 'Unit 3 — State Management Slides.pdf', type: 'pdf', size: '1.6 MB', uploaded: '2026-04-28' },
    ],
    assignments: [
      { id: 'ASN001', name: 'Portfolio Website — Phase 2 (Next.js)', dueDate: '2026-06-05', maxMarks: 30, submitted: false },
      { id: 'ASN002', name: 'REST API Design Report', dueDate: '2026-05-30', maxMarks: 20, submitted: true },
      { id: 'ASN003', name: 'Unit 3 Quiz', dueDate: '2026-05-10', maxMarks: 10, submitted: true },
    ],
  },
  {
    id: 'CLS002',
    code: 'DBMS-S4-2026',
    name: 'Database Management Systems',
    section: 'CSE Sem 4 — Batch 2026',
    colorClass: 'from-cyan-600 to-teal-700',
    colorHex: '#0891B2',
    teacher: 'Dr. Priya Mehta',
    students: 62,
    announcements: [
      {
        id: 'ANN004',
        date: '2026-05-25',
        title: 'SQL Lab Practical on June 2',
        body: 'Practical exam will cover Joins, Subqueries, Views, and Triggers. Bring your student ID card. No lab manual allowed. Duration: 2 Hours.',
        attachments: [],
      },
      {
        id: 'ANN005',
        date: '2026-05-18',
        title: 'ER Diagram Assignment Released',
        body: 'Design a complete ER Diagram for a Hospital Management System. Include all entities, relationships, cardinalities, and weak entities. Submission strictly via portal only.',
        attachments: [{ name: 'ER-Guidelines.pdf', type: 'pdf', size: '156 KB' }],
      },
    ],
    resources: [
      { id: 'RES005', name: 'Chapter 8 — Transaction Management.pdf', type: 'pdf', size: '2.1 MB', uploaded: '2026-05-12' },
      { id: 'RES006', name: 'DBMS Practice Queries — Set 4.zip', type: 'zip', size: '4.6 MB', uploaded: '2026-05-05' },
    ],
    assignments: [
      { id: 'ASN004', name: 'ER Diagram — Hospital Management System', dueDate: '2026-06-01', maxMarks: 25, submitted: false },
    ],
  },
  {
    id: 'CLS003',
    code: 'OS-S4-2026',
    name: 'Operating Systems',
    section: 'CSE Sem 4 — Batch 2026',
    colorClass: 'from-emerald-600 to-green-700',
    colorHex: '#059669',
    teacher: 'Prof. Anand Kapoor',
    students: 62,
    announcements: [
      {
        id: 'ANN006',
        date: '2026-05-22',
        title: 'Process Scheduling Simulation Submission',
        body: 'Implement any TWO CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority) in Python or C++. Include output screenshots and complexity analysis. Deadline: June 3.',
        attachments: [],
      },
    ],
    resources: [
      { id: 'RES007', name: 'Unit 5 — Memory Management.pdf', type: 'pdf', size: '1.8 MB', uploaded: '2026-05-14' },
      { id: 'RES008', name: 'OS Lab Manual — Part 2.pdf', type: 'pdf', size: '3.4 MB', uploaded: '2026-04-30' },
    ],
    assignments: [
      { id: 'ASN005', name: 'CPU Scheduling Simulation', dueDate: '2026-06-03', maxMarks: 30, submitted: false },
    ],
  },
];

// ------- Grievance Tickets (Initial Seed) -------

export const MOCK_GRIEVANCES_INITIAL = [
  {
    id: 'GRV001',
    studentId: 'STU202601',
    studentName: 'Arjun Sharma',
    studentBranch: 'CSE',
    studentSem: 4,
    type: 'bonafide' as const,
    purpose: 'Internship Verification',
    status: 'approved' as const,
    submittedAt: '2026-05-10T09:30:00Z',
    updatedAt: '2026-05-11T14:00:00Z',
    remarks: 'Bonafide certificate issued and dispatched to student. Valid for 3 months.',
    reviewedBy: 'Dr. Priya Mehta',
  },
  {
    id: 'GRV002',
    studentId: 'STU202601',
    studentName: 'Arjun Sharma',
    studentBranch: 'CSE',
    studentSem: 4,
    type: 'leave' as const,
    dateFrom: '2026-05-05',
    dateTo: '2026-05-06',
    reason: "Family function — sister's wedding ceremony in Surat.",
    status: 'approved' as const,
    submittedAt: '2026-05-03T10:00:00Z',
    updatedAt: '2026-05-04T09:00:00Z',
    remarks: 'Leave approved. Attendance marked accordingly. Medical certificate not required for 2-day leave.',
    reviewedBy: 'Dr. Priya Mehta',
    hasAttachment: false,
  },
];
