'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MOCK_FEES, MOCK_MARKS_INITIAL, MOCK_GRIEVANCES_INITIAL } from '@/lib/mockData';

// ============================================================
// Types
// ============================================================

export type UserRole = 'student' | 'teacher';

export interface StudentUser {
  role: 'student';
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  branchCode: string;
  semester: number;
  batch: string;
  section: string;
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  address: string;
  faceId: string;
  enrollmentStatus: string;
  attendancePercentage: number;
  admissionYear: number;
}

export interface TeacherUser {
  role: 'teacher';
  id: string;
  name: string;
  facultyId: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  cabinNo: string;
  joiningYear: number;
  qualifications: string[];
  assignedSubjects: { code: string; name: string; semester: number; batch: string }[];
  assignedClasses: { id: string; label: string; strength: number }[];
}

export type CurrentUser = StudentUser | TeacherUser | null;

export interface FeeItem {
  id: string;
  label: string;
  amount: number;
  paid: boolean;
}

export interface FeeState {
  semester: number;
  academicYear: string;
  dueDate: string;
  receiptPrefix: string;
  items: FeeItem[];
  paidAt?: string;
  receiptNo?: string;
  transactionId?: string;
}

export interface SubjectMark {
  internal: number | null;
  external: number | null;
}

export interface Sem4Marks {
  published: boolean;
  lockedAt?: string;
  subjects: Record<string, SubjectMark>;
}

export interface GrievanceTicket {
  id: string;
  studentId: string;
  studentName: string;
  studentBranch: string;
  studentSem: number;
  type: 'leave' | 'bonafide';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  updatedAt: string;
  reviewedBy?: string;
  remarks?: string;
  // Leave
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
  hasAttachment?: boolean;
  // Bonafide
  purpose?: string;
}

export interface AppState {
  currentUser: CurrentUser;
  fees: Record<string, FeeState>;
  marks: Record<string, { sem4: Sem4Marks }>;
  tickets: GrievanceTicket[];
  classroomConnected: boolean;
}

// ============================================================
// Actions
// ============================================================

type AppAction =
  | { type: 'LOGIN'; payload: CurrentUser }
  | { type: 'LOGOUT' }
  | { type: 'PAY_FEES'; payload: { studentId: string; receiptNo: string; transactionId: string } }
  | { type: 'UPDATE_MARK'; payload: { studentId: string; subjectCode: string; markType: 'internal' | 'external'; value: number | null } }
  | { type: 'PUBLISH_MARKS' }
  | { type: 'SUBMIT_TICKET'; payload: GrievanceTicket }
  | { type: 'UPDATE_TICKET'; payload: { id: string; status: GrievanceTicket['status']; remarks?: string; reviewedBy?: string } }
  | { type: 'CONNECT_CLASSROOM' }
  | { type: 'HYDRATE_USER'; payload: CurrentUser };

// ============================================================
// Initial State
// ============================================================

function buildInitialState(): AppState {
  const feeSrc = MOCK_FEES.STU202601;
  return {
    currentUser: null,
    fees: {
      STU202601: {
        semester: feeSrc.semester,
        academicYear: feeSrc.academicYear,
        dueDate: feeSrc.dueDate,
        receiptPrefix: feeSrc.receiptPrefix,
        items: feeSrc.items.map((i) => ({ ...i })),
      },
    },
    marks: {
      STU202601: {
        sem4: {
          published: false,
          subjects: Object.fromEntries(
            Object.entries(MOCK_MARKS_INITIAL.STU202601.sem4.subjects).map(([k, v]) => [k, { ...v }])
          ),
        },
      },
    },
    tickets: MOCK_GRIEVANCES_INITIAL.map((t) => ({ ...t })) as GrievanceTicket[],
    classroomConnected: false,
  };
}

// ============================================================
// Reducer
// ============================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };

    case 'LOGOUT':
      return { ...state, currentUser: null };

    case 'HYDRATE_USER':
      return { ...state, currentUser: action.payload };

    case 'PAY_FEES': {
      const sid = action.payload.studentId;
      return {
        ...state,
        fees: {
          ...state.fees,
          [sid]: {
            ...state.fees[sid],
            items: state.fees[sid].items.map((item) => ({ ...item, paid: true })),
            paidAt: new Date().toISOString(),
            receiptNo: action.payload.receiptNo,
            transactionId: action.payload.transactionId,
          },
        },
      };
    }

    case 'UPDATE_MARK': {
      const { studentId, subjectCode, markType, value } = action.payload;
      const existing = state.marks[studentId]?.sem4?.subjects?.[subjectCode] ?? { internal: null, external: null };
      return {
        ...state,
        marks: {
          ...state.marks,
          [studentId]: {
            ...state.marks[studentId],
            sem4: {
              ...state.marks[studentId].sem4,
              subjects: {
                ...state.marks[studentId].sem4.subjects,
                [subjectCode]: { ...existing, [markType]: value },
              },
            },
          },
        },
      };
    }

    case 'PUBLISH_MARKS':
      return {
        ...state,
        marks: {
          ...state.marks,
          STU202601: {
            ...state.marks.STU202601,
            sem4: {
              ...state.marks.STU202601.sem4,
              published: true,
              lockedAt: new Date().toISOString(),
            },
          },
        },
      };

    case 'SUBMIT_TICKET':
      return { ...state, tickets: [action.payload, ...state.tickets] };

    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                status: action.payload.status,
                updatedAt: new Date().toISOString(),
                remarks: action.payload.remarks ?? t.remarks,
                reviewedBy: action.payload.reviewedBy ?? t.reviewedBy,
              }
            : t
        ),
      };

    case 'CONNECT_CLASSROOM':
      return { ...state, classroomConnected: true };

    default:
      return state;
  }
}

// ============================================================
// Context + Provider
// ============================================================

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // Re-hydrate auth from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('presentify_user');
      if (raw) {
        const user = JSON.parse(raw) as CurrentUser;
        if (user) dispatch({ type: 'HYDRATE_USER', payload: user });
      }
    } catch {
      // silently ignore parse errors
    }
  }, []);

  // Persist auth to localStorage whenever it changes
  useEffect(() => {
    try {
      if (state.currentUser) {
        localStorage.setItem('presentify_user', JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem('presentify_user');
      }
    } catch {
      // silently ignore write errors
    }
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
