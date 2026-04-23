# Admin User Management System - Implementation Plan

## 📋 Overview
Enhanced user management system where admins can view users by category (Students, Club Admins, Faculty Managers) with full CRUD operations, PDF export, and form validations matching the student registration form.

---

## 🗺️ Navigation Flow

```
Admin Sidebar "User Management"
      ↓
/admin/users (Users Overview Page)
├─ Student Management Card
├─ Club Admin Management Card
└─ Faculty Managers Management Card
      ↓
Click "Student Management"
      ↓
/admin/users/students (Student Management Page)
├─ Students List Table
├─ Create Student Button → Create Student Modal
├─ Download PDF Button
└─ CRUD Actions (Edit, Delete, View)
```

---

## 📁 File Structure

### Pages (New/Modified)
```
frontend/src/pages/admin/
├─ AdminUsersPage.jsx (MODIFY)
│  └─ Show 3 management sections instead of table
├─ StudentManagementPage.jsx (NEW)
│  └─ Students list, filters, CRUD
├─ ClubAdminManagementPage.jsx (NEW)
│  └─ Club admins list, filters, CRUD
└─ FacultyManagersPage.jsx (ALREADY EXISTS)
   └─ Link from overview
```

### Components (New/Modified)
```
frontend/src/components/admin/
├─ UserOverviewCards.jsx (NEW)
│  └─ 3 Card components with stats and links
├─ StudentManagementSection.jsx (NEW)
│  └─ Container for student management
├─ CreateStudentModal.jsx (NEW)
│  └─ Form with validations (reuse RegisterPage validations)
├─ EditStudentModal.jsx (NEW)
│  └─ Edit student details
├─ DeleteConfirmationModal.jsx (NEW)
│  └─ Confirmation dialog before delete
├─ StudentTable.jsx (NEW)
│  └─ Display students with actions
└─ UserTable.jsx (KEEP AS IS)
```

### Utilities (New/Modified)
```
frontend/src/utils/
├─ passwordValidation.js (ALREADY EXISTS)
│  └─ Reuse for student password validation
├─ pdfExport.js (NEW)
│  └─ Export student list to PDF
└─ facultyDetection.js (NEW)
   └─ Auto-detect faculty from student ID
```

### API Integration
```
frontend/src/api/adminApi.js (MODIFY)
Add:
├─ createStudent(studentData)
├─ getStudents(filters)
├─ updateStudent(studentId, data)
├─ deleteStudent(studentId)
├─ getStudentStats()
├─ exportStudentListPDF()
└─ clubAdminFunctions...
```

---

## 🎯 Component Details

### 1. AdminUsersPage.jsx (MODIFIED)
**Current:** Shows user table with filters  
**New:** Overview page with 3 cards

```jsx
// ShowsThree Management Cards:
// ┌─────────────────────┐
// │ Student Mgmt        │
// │ 1,234 Students     │
// │ [Go to Management] │
// └─────────────────────┘

// ┌─────────────────────┐
// │ Club Admin Mgmt     │
// │ 156 Club Admins    │
// │ [Go to Management] │
// └─────────────────────┘

// ┌─────────────────────┐
// │ Faculty Mgmt        │
// │ 45 Managers        │
// │ [Go to Management] │
// └─────────────────────┘
```

---

### 2. StudentManagementPage.jsx (NEW)
**Location:** `/admin/users/students`

**Features:**
- Student list table with pagination/infinite scroll
- Filters: Search, Faculty, Status (Active/Inactive)
- Top right actions:
  - Download PDF button
  - Create Student button
- Table columns: Student ID, Name, Email, Faculty, Role, Points, Status, Actions
- Action menu: View Details, Edit, Delete, Deactivate/Activate

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Student Management                   [PDF] [+ Create] │
├─────────────────────────────────────────────────────┤
│ [Search] [Faculty ▼] [Status ▼] [Reset]             │
├─────────────────────────────────────────────────────┤
│ Student ID | Name | Email | Faculty | Points | ...   │
│ ─────────────────────────────────────────────────────│
│ IT23413474 | John... | john@... | Computing | 250 | ⋯ │
│ EN24567890 | Jane... | jane@... | Engineering | ... │
└─────────────────────────────────────────────────────┘
```

---

### 3. CreateStudentModal.jsx (NEW)

**Form Fields & Validations:**
```
┌─────────────────────────────────┐
│ Create New Student              │
├─────────────────────────────────┤
│ Full Name *                     │
│ [____________________]          │
│ Min 2 chars                     │
│                                 │
│ Student ID *                    │
│ [IT23413474]  (validate)        │
│ 2 letters + 6-8 digits          │
│ Faculty: Computing ✓            │
│                                 │
│ Email * (Auto-filled, Read-only)│
│ [it23413474@my.sliit.lk]       │
│                                 │
│ Password * (same as reg form)   │
│ [________________] [👁️]         │
│ ─────────────────────────────   │
│ ███─── Very Strong              │
│ ✓ Uppercase ✓ Lowercase ✓ Number│
│ ✓ Special Char                  │
│                                 │
│ Confirm Password *              │
│ [________________] [👁️]         │
│ Must match password             │
│                                 │
│ Role *                          │
│ [Student ▼]                    │
│ (Student, Club Admin, DeptLead) │
│                                 │
│ [Cancel] [Create Student]       │
└─────────────────────────────────┘
```

**Features:**
- Reuse password validation from RegisterPage
- Auto-fill & validate email from Student ID
- Faculty auto-detect from Student ID prefix
- Real-time validation feedback
- Success toast on creation
- Table auto-refresh

---

### 4. EditStudentModal.jsx (NEW)

**Editable Fields:**
- Full Name
- Role (Student, Club Admin, Dept Leader)
- Points (for rewards)
- Status (Active/Inactive)

**Read-only Fields:**
- Student ID
- Email
- Faculty
- Member Since

**Features:**
- Validation for name (min 2 chars)
- Points must be non-negative
- Save/Cancel buttons
- Success/Error toast
- Confirm unsaved changes

---

### 5. DeleteConfirmationModal.jsx (NEW)

**Content:**
```
┌──────────────────────────────────┐
│ Delete Student?                  │
├──────────────────────────────────┤
│ ⚠️ This action cannot be undone  │
│                                  │
│ Student: John Doe                │
│ ID: IT23413474                   │
│ Email: john@sliit.lk            │
│                                  │
│ [Cancel] [Delete]               │
└──────────────────────────────────┘
```

**Features:**
- Show student info for confirmation
- Red/danger styling
- Option for soft delete (mark inactive) vs hard delete
- Toast notification on success

---

### 6. StudentTable.jsx (NEW)

**Columns:**
| Student ID | Name | Email | Faculty | Role | Points | Status | Actions |
|-----------|------|-------|---------|------|--------|--------|---------|

**Actions Menu:**
- 👁️ View Details
- ✏️ Edit
- 🗑️ Delete
- ⊘ Deactivate (if active)
- ✓ Activate (if inactive)
- ✉️ Verify Email (if unverified)

---

## 🔌 API Endpoints Needed

### Students Management
```
GET    /api/admin/students
       Query: page, size, search, faculty, role, status
       Response: { data: [], total, page }

POST   /api/admin/students
       Body: { studentId, displayName, email, password, role }
       Response: { id, success }

GET    /api/admin/students/:id
       Response: { id, studentId, displayName, email, ... }

PUT    /api/admin/students/:id
       Body: { displayName, role, points, isActive }
       Response: { success }

DELETE /api/admin/students/:id
       Response: { success }

PATCH  /api/admin/students/:id/activate
PATCH  /api/admin/students/:id/deactivate
PATCH  /api/admin/students/:id/verify-email

GET    /api/admin/students/stats
       Response: { total, active, inactive, byFaculty }

GET    /api/admin/students/export/pdf
       Response: PDF file
```

### Club Admins Management
```
GET    /api/admin/club-admins
POST   /api/admin/club-admins
PUT    /api/admin/club-admins/:id
DELETE /api/admin/club-admins/:id
```

---

## 🎨 Design Consistency

**Reusable Components from RegisterPage:**
- Password validation & strength meter
- Email auto-fill logic
- Faculty detection from Student ID
- Form validation patterns
- Input styling & icons

**Styling:**
- Dark theme (slate-900, indigo accents)
- Consistent padding/spacing
- Hover states & transitions
- Responsive design (mobile-friendly)

---

## 📊 PDF Export Features

**Student List PDF:**
```
SLIIT UNI-CONNECT - Student List Export
Generated: April 11, 2026

Table:
┌──────────┬────────────┬──────────────┬────────────┬────────┐
│ Student  │ Name       │ Email        │ Faculty    │ Points │
├──────────┼────────────┼──────────────┼────────────┼────────┤
│ IT234... │ John Doe   │ john@sliit.. │ Computing  │ 250    │
│ EN245... │ Jane Smith │ jane@sliit.. │ Engineering│ 180    │
└──────────┴────────────┴──────────────┴────────────┴────────┘

Total Students: 1,234
Active: 1,200
Inactive: 34
```

---

## 🔄 Data Flow

### Create Student Flow
```
1. Click "+ Create Student"
2. CreateStudentModal opens
3. Enter Student ID → triggers:
   - Faculty auto-detect ✓
   - Email auto-fill ✓
   - Client-side validation ✓
4. Enter other fields
5. Password validation (strength meter updates)
6. Click "Create Student"
7. API call: POST /api/admin/students
8. Success → Toast + Modal close + Table refresh
9. Error → Toast + Stay modal open
```

### Edit Student Flow
```
1. Click "Edit" in table actions
2. EditStudentModal opens with data pre-filled
3. Modify fields (Name, Role, Points, Status)
4. Click "Save"
5. API call: PUT /api/admin/students/:id
6. Success → Toast + Modal close + Table refresh
7. Error → Toast + Stay modal open
```

### Delete Student Flow
```
1. Click "Delete" in table actions
2. DeleteConfirmationModal shows
3. Confirm student details
4. Click "Delete"
5. API call: DELETE /api/admin/students/:id
6. Success → Toast + Modal close + Table refresh
7. Error → Toast + Stay modal open
```

---

## 📋 Implementation Checklist

- [ ] Modify `AdminUsersPage.jsx` → Overview page
- [ ] Create `StudentManagementPage.jsx`
- [ ] Create `CreateStudentModal.jsx`
- [ ] Create `EditStudentModal.jsx`
- [ ] Create `DeleteConfirmationModal.jsx`
- [ ] Create `StudentTable.jsx`
- [ ] Create `pdfExport.js` utility
- [ ] Update `adminApi.js` with new endpoints
- [ ] Add routes in Router
- [ ] Update `AdminSidebar.jsx` navigation
- [ ] Test modal flows
- [ ] Test CRUD operations
- [ ] Test PDF export
- [ ] Form validation testing
- [ ] Responsive design testing

---

## 🎯 Priority Order

**Phase 1 (Core):**
1. Overview page with 3 cards
2. Student management page with table
3. Create student modal
4. API integration

**Phase 2 (Full CRUD):**
5. Edit student modal
6. Delete confirmation modal
7. All CRUD operations

**Phase 3 (Polish):**
8. PDF export
9. Advanced filters
10. Bulk operations

---

## 📝 Notes

- Reuse existing password validation component
- Leverage faculty detection from RegisterPage
- Email validation/auto-fill logic already exists
- Consider performance: pagination for large datasets
- Soft delete recommended (mark isActive = false)
- Token refresh validation on modal open
