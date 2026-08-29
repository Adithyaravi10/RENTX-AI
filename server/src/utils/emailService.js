import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return { simulated: true };
  }

  return transport.sendMail({
    from: `"RentX AI" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
};

export const sendBookingConfirmation = async (user, booking, vehicle) => {
  return sendEmail({
    to: user.email,
    subject: `Booking Confirmed - ${vehicle.name}`,
    html: `
      <h2>Your RentX AI booking is confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Vehicle: <strong>${vehicle.name}</strong></p>
      <p>From: ${new Date(booking.startTime).toLocaleString('en-IN')}</p>
      <p>To: ${new Date(booking.endTime).toLocaleString('en-IN')}</p>
      <p>Total: ₹${booking.totalPrice}</p>
      <p>Drive safe! 🚗</p>
    `,
  });
};

export const sendOTPEmail = async (email, otp) => {
  console.log(`[OTP] Email: ${email} | OTP: ${otp}`);
  return sendEmail({
    to: email,
    subject: 'RentX AI - Verify your account',
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
  });
};
