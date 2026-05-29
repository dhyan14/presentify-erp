# Presentify ERP — Phase 1

A modern Academic ERP portal for Students and Teachers, built with **Next.js 14**, **Tailwind CSS**, and a rich client-side mock data layer.

## 🚀 Deploy to Vercel

Click the button below or push this repo to GitHub and import it in Vercel — zero configuration required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## ✨ Features

### Demo Login
- **Student** — Roll No: `STU202601`
- **Teacher** — Faculty ID: `FAC202699`

### Student Modules
| Module | Features |
|--------|----------|
| Profile | Face ID biometric key, attendance log, personal info |
| Fee Management | Fee breakdown, Pay Now gateway simulation, printable receipt |
| Hall Ticket | Eligibility check (attendance + fee), QR-code hall ticket |
| Report Card | SPI/CPI, grade table, recharts trend chart |
| Grievance Desk | Leave request, bonafide certificate, real-time status timeline |
| Classroom Hub | Google Classroom sync, announcements, resources, assignments |

### Teacher Modules
| Module | Features |
|--------|----------|
| Profile | Faculty ID, qualifications, assigned classes/subjects |
| Marks Entry | Spreadsheet grid, per-cell validation, Lock & Publish |
| Admin Inbox | Ticket review, certificate letterhead preview, approve/reject |
| Classroom Hub | Same as student view |

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** React Context + useReducer
- **Charts:** Recharts
- **QR Code:** qrcode.react
- **Icons:** Lucide React

## 📁 Project Structure

```
app/
  page.tsx              # Login landing page
  dashboard/page.tsx    # Role-aware dashboard shell
components/
  layout/               # Sidebar, Topbar
  student/              # Student-specific modules
  teacher/              # Teacher-specific modules
  shared/               # ClassroomHub (shared)
context/
  AppContext.tsx         # Global state
lib/
  mockData.ts           # Mock database
  utils.ts              # Grade calculation, sanitization
```

## 🔒 No Backend Required
All data is mocked client-side. No environment variables needed for Phase 1.