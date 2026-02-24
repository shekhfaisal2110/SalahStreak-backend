// import PDFDocument from 'pdfkit';

// export const generateQuranReportPDF = (data, startDate, endDate) => {
//   const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
//   const buffers = [];

//   doc.on('data', buffers.push.bind(buffers));

//   return new Promise((resolve) => {
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     // Header
//     doc.fontSize(24).fillColor('#065f46').text('Quran Completion Report', { align: 'center' });
//     doc.moveDown(0.5);
//     doc.fontSize(14).fillColor('#1e293b').text(`From: ${startDate}  To: ${endDate}`, { align: 'center' });
//     doc.fontSize(10).fillColor('#475569').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
//     doc.moveDown(1.5);

//     // Summary
//     doc.fontSize(12).fillColor('#0f172a');
//     doc.text(`Total Completions: ${data.length}`);
//     doc.moveDown(2);

//     // Table
//     const startX = doc.x;
//     const tableWidth = 500;
//     const colWidths = [150, 150, 150];
//     const headers = ['Completion Date', 'Days Taken', 'Details'];
//     const rowHeight = 25;
//     let y = doc.y;

//     // Header background
//     doc.fillColor('#e2e8f0').rect(startX, y, tableWidth, rowHeight).fill();
//     doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11);

//     let x = startX;
//     headers.forEach((header, i) => {
//       doc.text(header, x + 5, y + 5, { width: colWidths[i], align: 'center' });
//       x += colWidths[i];
//     });

//     // Draw header borders
//     doc.strokeColor('#cbd5e1').lineWidth(1);
//     x = startX;
//     for (let i = 0; i <= headers.length; i++) {
//       doc.moveTo(x, y).lineTo(x, y + rowHeight * (data.length + 1)).stroke();
//       x += colWidths[i] || 0;
//     }
//     doc.moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

//     y += rowHeight;

//     // Rows
//     if (data.length === 0) {
//       doc.fillColor('#64748b').fontSize(10).text('No completions in this period.', startX, y + 10);
//     } else {
//       data.forEach((item, idx) => {
//         if (idx % 2 === 0) {
//           doc.fillColor('#f8fafc').rect(startX, y, tableWidth, rowHeight).fill();
//         }
//         doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
//         x = startX;

//         const date = new Date(item.completedAt).toLocaleDateString();
//         doc.text(date, x + 5, y + 5, { width: colWidths[0], align: 'center' });
//         x += colWidths[0];

//         const days = item.durationDays || '-';
//         doc.text(days.toString(), x + 5, y + 5, { width: colWidths[1], align: 'center' });
//         x += colWidths[1];

//         doc.text('Completed', x + 5, y + 5, { width: colWidths[2], align: 'center' });

//         // Horizontal line
//         doc.strokeColor('#cbd5e1').lineWidth(0.5)
//           .moveTo(startX, y + rowHeight)
//           .lineTo(startX + tableWidth, y + rowHeight)
//           .stroke();

//         y += rowHeight;
//       });

//       // Rightmost line
//       doc.moveTo(startX + tableWidth, doc.y - rowHeight * data.length)
//         .lineTo(startX + tableWidth, y)
//         .stroke();
//     }

//     // Footer
//     doc.fillColor('#64748b').fontSize(8).text(
//       'May Allah accept your efforts.',
//       startX,
//       doc.page.height - 40,
//       { align: 'center', width: tableWidth }
//     );

//     doc.end();
//   });
// };








import PDFDocument from 'pdfkit';

export const generateQuranReportPDF = (data, startDate, endDate) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Header
    doc.fontSize(24).fillColor('#065f46').text('Quran Completion Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#1e293b').text(`From: ${startDate}  To: ${endDate}`, { align: 'center' });
    doc.fontSize(10).fillColor('#475569').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Total Completions: ${data.length}`);
    doc.moveDown(2);

    // Table
    const startX = doc.x;
    const tableWidth = 500;
    const colWidths = [200, 150, 150];
    const headers = ['Completion Date', 'Days Taken', 'Details'];
    const rowHeight = 25;
    let y = doc.y;

    // Header background
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
      doc.moveTo(x, y).lineTo(x, y + rowHeight * (data.length + 1)).stroke();
      x += colWidths[i] || 0;
    }
    doc.moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

    y += rowHeight;

    // Rows
    if (data.length === 0) {
      doc.fillColor('#64748b').fontSize(10).text('No completions in this period.', startX, y + 10);
    } else {
      data.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.fillColor('#f8fafc').rect(startX, y, tableWidth, rowHeight).fill();
        }
        doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
        x = startX;

        const date = new Date(item.completedAt).toLocaleDateString();
        doc.text(date, x + 5, y + 5, { width: colWidths[0], align: 'center' });
        x += colWidths[0];

        const days = item.durationDays || '-';
        doc.text(days.toString(), x + 5, y + 5, { width: colWidths[1], align: 'center' });
        x += colWidths[1];

        doc.text('Completed', x + 5, y + 5, { width: colWidths[2], align: 'center' });

        // Horizontal line
        doc.strokeColor('#cbd5e1').lineWidth(0.5)
          .moveTo(startX, y + rowHeight)
          .lineTo(startX + tableWidth, y + rowHeight)
          .stroke();

        y += rowHeight;
      });

      // Rightmost line
      doc.moveTo(startX + tableWidth, doc.y - rowHeight * data.length)
        .lineTo(startX + tableWidth, y)
        .stroke();
    }

    // Footer
    doc.fillColor('#64748b').fontSize(8).text(
      'May Allah accept your efforts.',
      startX,
      doc.page.height - 40,
      { align: 'center', width: tableWidth }
    );

    doc.end();
  });
};