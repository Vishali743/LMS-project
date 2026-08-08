const nodemailer = require('nodemailer');
require('dotenv').config();

// Create SMTP transport config or mock fallback
const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com';

let transporter;
if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generic send helper with retries
async function sendMailWithRetry(mailOptions, retries = 3, delay = 2000) {
  if (!transporter) {
    console.log('\n=========================================');
    console.log('MOCK EMAIL LOGGED (Configure SMTP in backend/.env to send actual emails):');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('--- Body ---');
    console.log(mailOptions.text || mailOptions.html);
    console.log('=========================================\n');
    return true;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${mailOptions.to}. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`Email dispatch attempt ${attempt} failed for ${mailOptions.to}:`, err.message);
      if (attempt === retries) {
        console.error(`Email delivery failed permanently after ${retries} attempts.`);
        throw err;
      }
      await sleep(delay * attempt);
    }
  }
}

/**
 * Send welcome email to a new student
 */
async function sendWelcomeEmail(toEmail, studentName, studentCode) {
  const mailOptions = {
    from: `"Skein LMS Scholar Portal" <${process.env.SMTP_USER || 'no-reply@skeinlms.com'}>`,
    to: toEmail,
    subject: 'Welcome to Skein LMS - Your Scholar Portal Account is Active!',
    text: `Hello ${studentName || 'Scholar'},\n\nWelcome to Skein LMS! We are thrilled to have you join our online learning community.\n\nHere are your account credentials details:\n- Student ID: ${studentCode}\n- Registered Email: ${toEmail}\n\nYou can now log in to access your course modules, participate in quizzes, and complete weekly assignment deliverables.\n\nHappy Learning!\n\nBest regards,\nThe Skein LMS Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to Skein LMS!</h2>
        <p>Hello <strong>${studentName || 'Scholar'}</strong>,</p>
        <p>We are thrilled to have you join our online learning community. Your account has been successfully verified.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">Account Profile Details:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li><strong>Student ID:</strong> ${studentCode}</li>
            <li><strong>Registered Email:</strong> ${toEmail}</li>
          </ul>
        </div>
        <p>Log in using the email and password you configured to access your active courses dashboard, syllabus playlists, quizzes, and weekly assignments.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/login/student" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Launch Student Console</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions);
}

/**
 * Send course enrollment confirmation email
 */
async function sendEnrollmentEmail(toEmail, studentName, courseName, enrollmentDate, loginUrl, instructorName = 'Skein Instructor') {
  const mailOptions = {
    from: `"Skein LMS Scholar Portal" <${process.env.SMTP_USER || 'no-reply@skeinlms.com'}>`,
    to: toEmail,
    subject: `Enrollment Confirmed: ${courseName}`,
    text: `Hello ${studentName},\n\nYour enrollment in "${courseName}" has been successfully registered!\n\nDetails:\n- Student Name: ${studentName}\n- Course Name: ${courseName}\n- Enrollment Date: ${enrollmentDate}\n- Instructor Name: ${instructorName || 'Skein Expert'}\n\nLogin URL: ${loginUrl}\n\nYou can access the lessons list and weekly coursework elements directly from your student dashboard.\n\nGood luck with the course!\n\nBest regards,\nThe Skein LMS Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Enrollment Confirmed!</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>Your enrollment has been successfully registered. You now have full access to the course content.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">Enrollment Details:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li><strong>Course Name:</strong> ${courseName}</li>
            <li><strong>Enrollment Date:</strong> ${enrollmentDate}</li>
            <li><strong>Instructor:</strong> ${instructorName || 'Skein Expert'}</li>
          </ul>
        </div>
        <p>You can check the lectures, take module quizzes, and view assignment deadlines in the course player panel.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Course Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions);
}

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentEmail
};
