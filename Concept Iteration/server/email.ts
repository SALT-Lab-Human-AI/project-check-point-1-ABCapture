import { createTransport } from 'nodemailer';
import type { Incident, Student } from '@shared/schema';

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use Gmail or a test service like Ethereal
  // For production, use a service like SendGrid, AWS SES, or Mailgun
  
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('[Email] Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

const generateIncidentEmailHTML = (incident: Incident, student: Student) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4F46E5; }
        .value { margin-top: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Incident Report</h1>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Student:</div>
            <div class="value">${student.name}</div>
          </div>
          
          <div class="section">
            <div class="label">Date:</div>
            <div class="value">${new Date(incident.date).toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="label">Time:</div>
            <div class="value">${incident.time}</div>
          </div>
          
          <div class="section">
            <div class="label">Incident Type:</div>
            <div class="value">${incident.incidentType}</div>
          </div>
          
          <div class="section">
            <div class="label">Summary:</div>
            <div class="value">${incident.summary}</div>
          </div>
          
          <div class="section">
            <div class="label">Antecedent (What happened before):</div>
            <div class="value">${incident.antecedent}</div>
          </div>
          
          <div class="section">
            <div class="label">Behavior:</div>
            <div class="value">${incident.behavior}</div>
          </div>
          
          <div class="section">
            <div class="label">Consequence (What happened after):</div>
            <div class="value">${incident.consequence}</div>
          </div>
          
          ${incident.location ? `
          <div class="section">
            <div class="label">Location:</div>
            <div class="value">${incident.location}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>This is an automated message from ABCapture Incident Tracking System.</p>
          <p>If you have questions, please contact your child's teacher.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendIncidentEmail = async (
  recipientEmails: string[],
  incident: Incident,
  student: Student,
  teacherEmail?: string
): Promise<{ success: boolean; message: string }> => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file.',
    };
  }

  try {
    const emailHTML = generateIncidentEmailHTML(incident, student);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails.join(', '),
      replyTo: teacherEmail || process.env.EMAIL_USER, // Guardians can reply to the teacher
      subject: `Incident Report for ${student.name} - ${new Date(incident.date).toLocaleDateString()}`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    console.log('[Email] Successfully sent incident report to:', recipientEmails.join(', '));
    
    return {
      success: true,
      message: `Email sent successfully to ${recipientEmails.length} recipient(s)`,
    };
  } catch (error: any) {
    console.error('[Email] Failed to send email:', error);
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
};
