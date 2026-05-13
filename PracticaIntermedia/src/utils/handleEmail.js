import nodemailer from 'nodemailer';

// Crear transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Enviar email de bienvenida
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '¡Bienvenido a Práctica Intermedia!',
      html: `
        <h2>¡Hola ${name}!</h2>
        <p>Te has registrado exitosamente en nuestra plataforma.</p>
        <p>Ahora puedes acceder a:</p>
        <ul>
          <li>Gestión de clientes</li>
          <li>Gestión de proyectos</li>
          <li>Gestión de albaranes</li>
          <li>Generación de PDFs</li>
        </ul>
        <p><strong>Gracias por usar nuestra plataforma!</strong></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error.message);
    return false;
  }
};

/**
 * Enviar email de confirmación de código
 */
export const sendVerificationCodeEmail = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Código de verificación',
      html: `
        <h2>Verificación de correo electrónico</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color: #007bff; text-align: center; font-size: 48px; letter-spacing: 5px;">${code}</h1>
        <p>Este código expira en 10 minutos.</p>
        <p>Si no solicitaste este código, ignora este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error.message);
    return false;
  }
};

/**
 * Enviar email de recuperación de contraseña
 */
export const sendPasswordRecoveryEmail = async (email, name, resetLink) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>¡Hola ${name}!</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz click en el siguiente enlace:</p>
        <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a></p>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste esto, ignora este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error.message);
    return false;
  }
};

/**
 * Enviar notificación de albarán firmado
 */
export const sendDeliveryNoteSigned = async (email, clientName, deliveryNoteId) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Albarán #${deliveryNoteId} ha sido firmado`,
      html: `
        <h2>Albarán firmado</h2>
        <p>El albarán <strong>#${deliveryNoteId}</strong> ha sido firmado por <strong>${clientName}</strong>.</p>
        <p>Puedes descargarlo desde el dashboard.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de firma enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de firma:', error.message);
    return false;
  }
};

/**
 * Enviar notificación de proyecto completado
 */
export const sendProjectCompletedEmail = async (email, projectName, projectId) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Proyecto "${projectName}" completado`,
      html: `
        <h2>Proyecto completado</h2>
        <p>El proyecto <strong>"${projectName}"</strong> (ID: ${projectId}) ha sido marcado como completado.</p>
        <p>¡Excelente trabajo!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de proyecto completado enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de proyecto:', error.message);
    return false;
  }
};
