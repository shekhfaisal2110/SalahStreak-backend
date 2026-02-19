// import PDFDocument from 'pdfkit';

// export const generatePrayerReportPDF = (data, period) => {
//   const doc = new PDFDocument();
//   const buffers = [];
  
//   doc.on('data', buffers.push.bind(buffers));
  
//   return new Promise((resolve) => {
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     doc.fontSize(20).text('Prayer Report', { align: 'center' });
//     doc.fontSize(14).text(`Period: ${period}`, { align: 'center' });
//     doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
//     doc.moveDown();

//     doc.fontSize(12).text(`Total Prayers Offered: ${data.offered}`);
//     doc.text(`Total Prayers Missed: ${data.missed}`);
//     doc.text(`Completion Rate: ${data.completionRate}%`);
//     doc.moveDown();

//     doc.fontSize(14).text('Prayer Breakdown:', { underline: true });
//     data.breakdown.forEach(item => {
//       doc.fontSize(12).text(`${item.prayer}: Offered ${item.offered}, Missed ${item.missed} (${item.percentage}%)`);
//     });

//     doc.end();
//   });
// };








import PDFDocument from 'pdfkit';

export const generatePrayerReportPDF = (data, period) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // ---------- Header ----------
    doc.fontSize(24).fillColor('#065f46').text('Prayer Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#1e293b').text(`Period: ${period}`, { align: 'center' });
    doc.fontSize(10).fillColor('#475569').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // ---------- Summary Stats ----------
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Total Prayers Offered: ${data.offered}`);
    doc.text(`Total Prayers Missed: ${data.missed}`);
    doc.text(`Completion Rate: ${data.completionRate}%`);
    doc.moveDown(2);

    // ---------- Table Configuration ----------
    const startX = doc.x;
    const tableWidth = 550;
    const colWidths = [100, 90, 90, 90, 90, 90]; // adjust for balance
    const headers = ['Date', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const rowHeight = 25;
    let y = doc.y;

    // Draw table header with background
    doc.fillColor('#e2e8f0').rect(startX, y, tableWidth, rowHeight).fill();
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11);

    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x + 5, y + 5, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    });

    // Draw header borders
    doc.strokeColor('#cbd5e1').lineWidth(1);
    x = startX;
    for (let i = 0; i <= headers.length; i++) {
      doc.moveTo(x, y).lineTo(x, y + rowHeight * (data.dailyEntries?.length + 1)).stroke();
      x += colWidths[i] || 0;
    }
    doc.moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

    y += rowHeight;

    // ---------- Table Rows ----------
    if (!data.dailyEntries || data.dailyEntries.length === 0) {
      doc.fillColor('#64748b').font('Helvetica').fontSize(10)
        .text('No prayer data available for the selected period.', startX, y + 10);
    } else {
      data.dailyEntries.forEach((entry, rowIndex) => {
        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.fillColor('#f8fafc').rect(startX, y, tableWidth, rowHeight).fill();
        }

        doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
        x = startX;

        // Date column
        doc.text(entry.date, x + 5, y + 5, { width: colWidths[0], align: 'center' });
        x += colWidths[0];

        // Prayer columns
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        prayers.forEach((prayer, idx) => {
          const isOffered = entry.prayers[prayer];
          doc.fillColor(isOffered ? '#059669' : '#b91c1c')
             .text(isOffered ? 'Yes' : 'No', x + 5, y + 5, { width: colWidths[idx + 1], align: 'center' });
          x += colWidths[idx + 1];
        });

        // Draw horizontal line after each row
        doc.strokeColor('#cbd5e1').lineWidth(0.5)
          .moveTo(startX, y + rowHeight)
          .lineTo(startX + tableWidth, y + rowHeight)
          .stroke();

        y += rowHeight;
      });

      // Draw rightmost vertical line
      doc.moveTo(startX + tableWidth, doc.y - rowHeight * data.dailyEntries.length)
        .lineTo(startX + tableWidth, y)
        .stroke();
    }

    // ---------- Footer ----------
    doc.fillColor('#64748b').fontSize(8).text(
      'May Allah accept your efforts.',
      startX,
      doc.page.height - 40,
      { align: 'center', width: tableWidth }
    );

    doc.end();
  });
};