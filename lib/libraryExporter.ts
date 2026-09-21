/**
 * Mentis Scholarly Library Exporter
 *
 * Generates physical-record print-ready PDFs and structured Word (.docx) catalogues.
 */

import { Book, Course, LibraryExportConfig } from '@/types/mentis';

export interface ExportStatistics {
  totalBooks: number;
  totalPages: number;
  pagesRead: number;
  completionRate: number;
  categoryBreakdown: { category: string; count: number }[];
}

export function computeLibraryStats(books: Book[]): ExportStatistics {
  const totalBooks = books.length;
  const totalPages = books.reduce((acc, b) => acc + (b.totalPages || 0), 0);
  const pagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
  const completionRate = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;

  const categoryMap = new Map<string, number>();
  books.forEach((b) => {
    categoryMap.set(b.category, (categoryMap.get(b.category) || 0) + 1);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  return {
    totalBooks,
    totalPages,
    pagesRead,
    completionRate,
    categoryBreakdown,
  };
}

export function filterBooksForExport(
  books: Book[],
  config: LibraryExportConfig
): Book[] {
  switch (config.scope) {
    case 'in_progress':
      return books.filter((b) => b.progress > 0 && b.progress < 100);
    case 'completed':
      return books.filter((b) => b.progress === 100);
    case 'by_category':
      return config.selectedCategory
        ? books.filter((b) => b.category.toLowerCase() === config.selectedCategory?.toLowerCase())
        : books;
    case 'all':
    default:
      return books;
  }
}

/**
 * Generates and triggers high-fidelity print-to-PDF
 */
export function exportToPhysicalPDF(
  books: Book[],
  courses: Course[],
  config: LibraryExportConfig,
  scholarName: string = 'Abdullah Saeed'
): void {
  const targetBooks = filterBooksForExport(books, config);
  const stats = computeLibraryStats(targetBooks);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to generate the physical PDF catalogue.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mentis Bibliotheca Scholastica - Physical Catalogue</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 15mm 20mm 15mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Cinzel', 'Garamond', 'Georgia', serif;
      background: #FAF7EE;
      color: #173B2D;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .catalogue-container {
      max-width: 820px;
      margin: 0 auto;
      border: 2px solid #B59A62;
      padding: 32px;
      background: #FFFDF8;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      position: relative;
    }
    .inner-border {
      border: 1px solid #E3DAC1;
      padding: 24px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #173B2D;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .crest {
      font-size: 28px;
      color: #B59A62;
      letter-spacing: 4px;
      font-weight: bold;
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #173B2D;
      margin: 4px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 11px;
      color: #8E7541;
      font-style: italic;
      letter-spacing: 1px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #202820;
      border-bottom: 1px dashed #B59A62;
      padding: 8px 0;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .stat-card {
      background: #FAF7EE;
      border: 1px solid #E3DAC1;
      padding: 10px;
      border-radius: 6px;
    }
    .stat-val {
      font-size: 18px;
      font-weight: bold;
      color: #173B2D;
    }
    .stat-lbl {
      font-size: 9px;
      text-transform: uppercase;
      color: #8E7541;
      letter-spacing: 1px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 24px;
    }
    th {
      background: #173B2D;
      color: #F3EEDB;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 1px solid #173B2D;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #E3DAC1;
      vertical-align: middle;
    }
    tr:nth-child(even) {
      background: #FAF7EE;
    }
    .progress-bar-bg {
      width: 100%;
      background: #EAE2C8;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 3px;
    }
    .progress-bar-fill {
      background: #173B2D;
      height: 100%;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-completed { background: #D1E7DD; color: #0F5132; }
    .status-reading { background: #FFF3CD; color: #664D03; }
    .status-unopened { background: #E2E3E5; color: #41464B; }
    .footer {
      border-top: 1px solid #B59A62;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #8E7541;
      font-style: italic;
    }
    .seal-text {
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .print-button-bar {
      margin-bottom: 20px;
      text-align: center;
    }
    .action-btn {
      background: #173B2D;
      color: #F3EEDB;
      border: none;
      padding: 10px 24px;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      border-radius: 6px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="print-button-bar no-print">
    <button class="action-btn" onclick="window.print()">Print Physical Parchment / Save as PDF</button>
  </div>

  <div class="catalogue-container">
    <div class="inner-border">
      <div class="header">
        <div class="crest">✦ MENTIS ✦</div>
        <div class="title">Bibliotheca Scholastica</div>
        <div class="subtitle">Official Ledger & Register of Academic Volumes</div>
      </div>

      <div class="meta-bar">
        <span><strong>Scholar:</strong> ${scholarName}</span>
        <span><strong>Scope:</strong> ${config.scope.toUpperCase().replace('_', ' ')}</span>
        <span><strong>Date of Record:</strong> ${currentDate}</span>
      </div>

      ${
        config.includeStats
          ? `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val">${stats.totalBooks}</div>
          <div class="stat-lbl">Codexes Shelved</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${stats.totalPages.toLocaleString()}</div>
          <div class="stat-lbl">Total Folios</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${stats.pagesRead.toLocaleString()}</div>
          <div class="stat-lbl">Folios Read</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${stats.completionRate}%</div>
          <div class="stat-lbl">Scholar Mastery</div>
        </div>
      </div>
      `
          : ''
      }

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 35%;">Volume Title & Author</th>
            <th style="width: 20%;">Field / Discipline</th>
            <th style="width: 15%;">Course</th>
            <th style="width: 25%;">Reading Mastery</th>
          </tr>
        </thead>
        <tbody>
          ${targetBooks
            .map((b, idx) => {
              const courseCode = b.courseId ? courseMap.get(b.courseId) || 'Elective' : 'Independent';
              const statusClass =
                b.progress === 100
                  ? 'status-completed'
                  : b.progress > 0
                  ? 'status-reading'
                  : 'status-unopened';
              const statusLabel =
                b.progress === 100
                  ? 'Mastered'
                  : b.progress > 0
                  ? 'In Contemplation'
                  : 'Unopened';

              return `
            <tr>
              <td style="text-align: center; color: #8E7541; font-weight: bold;">${idx + 1}</td>
              <td>
                <div style="font-weight: bold; color: #173B2D;">${b.title}</div>
                <div style="font-style: italic; color: #555; font-size: 10px;">by ${b.author}</div>
                ${
                  config.includeNotes && b.notes
                    ? `<div style="font-size: 9px; color: #8E7541; margin-top: 4px; font-style: italic;">“${b.notes}”</div>`
                    : ''
                }
              </td>
              <td><span style="text-transform: uppercase; font-size: 10px; font-weight: 600;">${b.category}</span></td>
              <td><span style="font-size: 10px;">${courseCode}</span></td>
              <td>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="status-badge ${statusClass}">${statusLabel}</span>
                  <span style="font-size: 10px; font-weight: bold;">${b.currentPage} / ${b.totalPages} (${b.progress}%)</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${b.progress}%;"></div>
                </div>
              </td>
            </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <span class="seal-text">Official Mentis Academic Repository Archive</span>
        <span>Page 1 of 1 • Signed under Scholar Vigil</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Generates and triggers download of an academic Microsoft Word (.docx) document
 */
export function exportToWordDocx(
  books: Book[],
  courses: Course[],
  config: LibraryExportConfig,
  scholarName: string = 'Abdullah Saeed'
): void {
  const targetBooks = filterBooksForExport(books, config);
  const stats = computeLibraryStats(targetBooks);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  // Create an Office HTML-compatible Word document MIME string
  const docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Mentis Bibliotheca Scholastica - Register of Books</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Garamond', 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #173B2D;
    }
    h1 {
      font-size: 20pt;
      color: #173B2D;
      text-align: center;
      margin-bottom: 2pt;
      text-transform: uppercase;
    }
    h2 {
      font-size: 12pt;
      color: #8E7541;
      text-align: center;
      margin-top: 0;
      font-style: italic;
    }
    .meta-table {
      width: 100%;
      border-bottom: 1pt solid #B59A62;
      margin-bottom: 15pt;
      font-size: 10pt;
    }
    table.catalogue {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10pt;
      font-size: 10pt;
    }
    table.catalogue th {
      background-color: #173B2D;
      color: #FAF7EE;
      font-weight: bold;
      border: 1pt solid #173B2D;
      padding: 6pt;
      text-align: left;
    }
    table.catalogue td {
      border: 1pt solid #D3C7A8;
      padding: 6pt;
      vertical-align: top;
    }
    .stat-box {
      background-color: #FAF7EE;
      border: 1pt solid #D3C7A8;
      padding: 8pt;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Mentis Bibliotheca Scholastica</h1>
  <h2>Register of Academic Volumes & Codexes</h2>

  <table class="meta-table">
    <tr>
      <td><strong>Scholar:</strong> ${scholarName}</td>
      <td style="text-align: right;"><strong>Date:</strong> ${currentDate}</td>
    </tr>
    <tr>
      <td><strong>Scope:</strong> ${config.scope.toUpperCase().replace('_', ' ')}</td>
      <td style="text-align: right;"><strong>Total Volumes:</strong> ${stats.totalBooks}</td>
    </tr>
  </table>

  ${
    config.includeStats
      ? `
  <table style="width: 100%; margin-bottom: 15pt;">
    <tr>
      <td class="stat-box"><strong>Volumes:</strong> ${stats.totalBooks}</td>
      <td class="stat-box"><strong>Total Folios:</strong> ${stats.totalPages}</td>
      <td class="stat-box"><strong>Folios Read:</strong> ${stats.pagesRead}</td>
      <td class="stat-box"><strong>Completion:</strong> ${stats.completionRate}%</td>
    </tr>
  </table>
  `
      : ''
  }

  <table class="catalogue">
    <thead>
      <tr>
        <th style="width: 30pt;">#</th>
        <th>Volume Title & Author</th>
        <th>Discipline / Category</th>
        <th>Course</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      ${targetBooks
        .map((b, idx) => {
          const courseCode = b.courseId ? courseMap.get(b.courseId) || 'Elective' : 'Independent';
          const status =
            b.progress === 100
              ? 'Mastered'
              : b.progress > 0
              ? 'In Contemplation'
              : 'Unopened';

          return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>
            <strong>${b.title}</strong><br/>
            <em>by ${b.author}</em>
            ${
              config.includeNotes && b.notes
                ? `<br/><span style="font-size: 8.5pt; color: #666;">Note: ${b.notes}</span>`
                : ''
            }
          </td>
          <td>${b.category}</td>
          <td>${courseCode}</td>
          <td>${status} (${b.currentPage} / ${b.totalPages} p. — ${b.progress}%)</td>
        </tr>
        `;
        })
        .join('')}
    </tbody>
  </table>

  <p style="margin-top: 25pt; font-size: 9pt; color: #8E7541; text-align: center; font-style: italic;">
    Certified record generated from Mentis Academic Desktop.
  </p>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Mentis_Catalogue_${config.scope}_${new Date().toISOString().slice(0, 10)}.doc`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
