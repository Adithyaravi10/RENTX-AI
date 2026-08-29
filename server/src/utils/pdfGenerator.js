import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (booking, user, vehicle, payment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(24).fillColor('#00d4ff').text('RentX AI', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#333').text('INVOICE', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(10).fillColor('#666');
    doc.text(`Invoice ID: ${booking.id}`);
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#000').text('Customer Details', { underline: true });
    doc.fontSize(10).fillColor('#333');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#000').text('Vehicle Details', { underline: true });
    doc.fontSize(10).fillColor('#333');
    doc.text(`Vehicle: ${vehicle.name} (${vehicle.brand})`);
    doc.text(`Category: ${vehicle.category} | Fuel: ${vehicle.fuelType}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#000').text('Booking Details', { underline: true });
    doc.fontSize(10).fillColor('#333');
    doc.text(`Start: ${new Date(booking.startTime).toLocaleString('en-IN')}`);
    doc.text(`End: ${new Date(booking.endTime).toLocaleString('en-IN')}`);
    doc.text(`Surge Multiplier: ${booking.surgeMultiplier}x`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#00d4ff');
    doc.text(`Total Amount: ₹${booking.totalPrice.toFixed(2)}`, { align: 'right' });

    if (payment) {
      doc.moveDown();
      doc.fontSize(10).fillColor('#333');
      doc.text(`Payment Method: ${payment.method}`);
      doc.text(`Payment Status: ${payment.status}`);
      doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
    }

    doc.moveDown(3);
    doc.fontSize(8).fillColor('#999').text(
      'Thank you for choosing RentX AI. Drive safe, drive green!',
      { align: 'center' }
    );

    doc.end();
  });
};

export const generateAgreementPDF = (booking, user, vehicle, signatureBase64) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('VEHICLE RENTAL AGREEMENT', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(10).text(
      `This Rental Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString('en-IN')} between RentX AI ("Lessor") and ${user.name} ("Lessee").`
    );
    doc.moveDown();

    doc.fontSize(12).text('1. Vehicle Details');
    doc.fontSize(10).text(`Vehicle: ${vehicle.name} - ${vehicle.brand}`);
    doc.text(`Registration Category: ${vehicle.category}`);
    doc.moveDown();

    doc.fontSize(12).text('2. Rental Period');
    doc.fontSize(10).text(`From: ${new Date(booking.startTime).toLocaleString('en-IN')}`);
    doc.text(`To: ${new Date(booking.endTime).toLocaleString('en-IN')}`);
    doc.text(`Total Price: ₹${booking.totalPrice}`);
    doc.moveDown();

    doc.fontSize(12).text('3. Terms & Conditions');
    doc.fontSize(10).text(
      '• Lessee must hold a valid driving license.\n' +
        '• Vehicle must be returned in same condition.\n' +
        '• Lessee is responsible for traffic violations during rental.\n' +
        '• Fuel/battery level must match pickup level on return.\n' +
        '• Insurance coverage as per RentX AI policy applies.'
    );
    doc.moveDown(2);

    if (signatureBase64) {
      doc.fontSize(12).text('Lessee Signature:');
      try {
        const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imgBuffer, { width: 150, height: 60 });
      } catch {
        doc.text('[Signature on file]');
      }
    }

    doc.moveDown();
    doc.text(`Signed by: ${user.name}`);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);

    doc.end();
  });
};
