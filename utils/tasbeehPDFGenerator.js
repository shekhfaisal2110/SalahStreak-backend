import PDFDocument from 'pdfkit';

export const generateTasbeehDailyReportPDF = (data, startDate, endDate) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // ---------- Header ----------
    doc.fontSize(24).fillColor('#065f46').text('Tasbeeh Daily Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#1e293b').text(`From: ${startDate}  To: ${endDate}`, { align: 'center' });
    doc.fontSize(10).fillColor('#475569').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // ---------- Summary Stats ----------
    const totalCount = data.reduce((sum, item) => sum + item.total, 0);
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Total Dhikr Count: ${totalCount}`);
    doc.moveDown(2);

    // ---------- Table Configuration ----------
    const startX = doc.x;
    const tableWidth = 550;
    const colWidths = [275, 275]; // two equal columns
    const headers = ['Date', 'Total Count'];
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
      doc.moveTo(x, y).lineTo(x, y + rowHeight * (data.length + 1)).stroke();
      x += colWidths[i] || 0;
    }
    doc.moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

    y += rowHeight;

    // ---------- Table Rows ----------
    if (!data || data.length === 0) {
      doc.fillColor('#64748b').font('Helvetica').fontSize(10)
        .text('No data available for the selected period.', startX, y + 10);
    } else {
      data.forEach((item, rowIndex) => {
        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.fillColor('#f8fafc').rect(startX, y, tableWidth, rowHeight).fill();
        }

        doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
        x = startX;

        // Date column (convert YYYY-MM-DD to DD-MM-YYYY)
        const dateParts = item._id.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : item._id;
        doc.text(formattedDate, x + 5, y + 5, { width: colWidths[0], align: 'center' });
        x += colWidths[0];

        // Total count column
        doc.text(item.total.toString(), x + 5, y + 5, { width: colWidths[1], align: 'center' });

        // Draw horizontal line after each row
        doc.strokeColor('#cbd5e1').lineWidth(0.5)
          .moveTo(startX, y + rowHeight)
          .lineTo(startX + tableWidth, y + rowHeight)
          .stroke();

        y += rowHeight;
      });

      // Draw rightmost vertical line
      doc.moveTo(startX + tableWidth, doc.y - rowHeight * data.length)
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