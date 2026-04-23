/**
 * PDF Export Utility for Student Management
 * Generates professional PDF reports of student data
 */

// Helper function to get current date formatted
function getDateFormatted() {
  const date = new Date();
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to convert data to CSV for PDF
function generateCSVContent(students, filters) {
  const headers = ['Student ID', 'Full Name', 'Email', 'Faculty', 'Role', 'Status', 'Email Verified', 'Points'];
  const rows = students.map((s) => [
    s.studentId || '',
    s.displayName || '',
    s.email || '',
    s.faculty || 'N/A',
    s.role === 'STUDENT' ? 'Student' : s.role === 'CLUB_ADMIN' ? 'Club Admin' : 'Dept Leader',
    s.isActive ? 'Active' : 'Inactive',
    s.isEmailVerified ? 'Yes' : 'No',
    s.points || 0,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csv;
}

// Helper to generate HTML table for PDF
function generateHTMLTable(students) {
  const rows = students
    .map(
      (s) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">${s.studentId}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">${s.displayName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">${s.email}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">${s.faculty || 'N/A'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px;">${
        s.role === 'STUDENT' ? 'Student' : s.role === 'CLUB_ADMIN' ? 'Club Admin' : 'Dept Leader'
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: ${
        s.isActive ? '#10b981' : '#f59e0b'
      };">${s.isActive ? 'Active' : 'Inactive'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${
        s.isEmailVerified ? '✓' : '✗'
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 10px; font-weight: 600;">${
        s.points || 0
      }</td>
    </tr>
  `
    )
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #4f46e5;">
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Student ID</th>
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Name</th>
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Email</th>
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Faculty</th>
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Role</th>
          <th style="padding: 10px; text-align: left; font-weight: 700; font-size: 11px; color: #1f2937;">Status</th>
          <th style="padding: 10px; text-align: center; font-weight: 700; font-size: 11px; color: #1f2937;">Verified</th>
          <th style="padding: 10px; text-align: center; font-weight: 700; font-size: 11px; color: #1f2937;">Points</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Generate HTML for PDF document
export function generatePDFHTML(students, filters) {
  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive).length,
    inactive: students.filter((s) => !s.isActive).length,
    verified: students.filter((s) => s.isEmailVerified).length,
  };

  const filterText = [];
  if (filters.search) filterText.push(`Search: "${filters.search}"`);
  if (filters.faculty) filterText.push(`Faculty: ${filters.faculty}`);
  if (filters.status) filterText.push(`Status: ${filters.status}`);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Student Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; }
          .container { width: 100%; max-width: 1000px; margin: 0 auto; padding: 40px; }
          .header { margin-bottom: 40px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; margin-bottom: 10px; }
          .logo span { color: #fbbf24; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 5px; color: #1f2937; }
          .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
          .date { font-size: 11px; color: #9ca3af; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: 700; color: #4f46e5; }
          .stat-label { font-size: 11px; color: #6b7280; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
          .filters { background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 11px; }
          .filters-label { font-weight: 700; color: #1f2937; margin-bottom: 5px; }
          .filters-text { color: #6b7280; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; text-align: center; color: #9ca3af; }
          table { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo"><span>SLIIT</span> UC Admin</div>
            <div class="title">Student Management Report</div>
            <div class="subtitle">Comprehensive Student Database Export</div>
            <div class="date">Generated on ${getDateFormatted()}</div>
          </div>

          <!-- Statistics -->
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${stats.total}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${stats.active}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${stats.inactive}</div>
              <div class="stat-label">Inactive</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${stats.verified}</div>
              <div class="stat-label">Email Verified</div>
            </div>
          </div>

          <!-- Filters Applied -->
          ${
            filterText.length > 0
              ? `
            <div class="filters">
              <div class="filters-label">Filters Applied:</div>
              <div class="filters-text">${filterText.join(' • ')}</div>
            </div>
          `
              : ''
          }

          <!-- Table -->
          ${generateHTMLTable(students)}

          <!-- Footer -->
          <div class="footer">
            <p>SLIIT University Connect - Admin Dashboard</p>
            <p style="margin-top: 5px;">Confidential - For Internal Use Only</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Export students as PDF
 * @param {Array} students - Array of student objects
 * @param {Object} filters - Current filter settings
 */
export function exportStudentsAsPDF(students, filters = {}) {
  if (students.length === 0) {
    alert('No students to export');
    return;
  }

  // Generate HTML content
  const htmlContent = generatePDFHTML(students, filters);

  // Create a blob with the HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const html = URL.createObjectURL(blob);

  // Open in new window for printing
  const printWindow = window.open(html);

  // After a brief delay, trigger print dialog
  setTimeout(() => {
    printWindow.document.title = `students-report-${new Date().getTime()}.pdf`;
    printWindow.print();

    // Close the window after printing (note: some browsers may not allow this)
    setTimeout(() => printWindow.close(), 500);
  }, 250);
}

/**
 * Export students as CSV (for data analysis)
 * @param {Array} students - Array of student objects
 * @param {Object} filters - Current filter settings
 */
export function exportStudentsAsCSV(students, filters = {}) {
  if (students.length === 0) {
    alert('No students to export');
    return;
  }

  const csv = generateCSVContent(students, filters);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `students-export-${new Date().getTime()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
