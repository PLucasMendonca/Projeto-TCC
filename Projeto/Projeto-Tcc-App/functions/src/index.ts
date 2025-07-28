const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuração do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'p.lucas.santos.mendonca@gmail.com', // Email configurado
    pass: process.env.EMAIL_PASSWORD // Senha do app será configurada no Firebase
  }
});

exports.sendFeedbackEmail = functions.firestore
  .document('feedback/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    
    const mailOptions = {
      from: 'GamerSlayer App <p.lucas.santos.mendonca@gmail.com>',
      to: 'lucas.s.mendonca@iesb.edu.br',
      subject: '🎮 Novo Feedback do GamerSlayer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2196F3;">Novo Feedback Recebido</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Avaliações</h3>
            <p>⭐ Avaliação do App: ${feedback.appRating}/5</p>
            <p>🎯 Compatibilidade: ${feedback.compatibilityRating}/5</p>
            <p>✅ Atendeu Expectativas: ${feedback.metExpectations ? 'Sim' : 'Não'}</p>
          </div>
          
          ${feedback.technicalIssues ? `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Problemas Técnicos Relatados</h3>
              <p>${feedback.technicalIssues}</p>
            </div>
          ` : ''}
          
          ${feedback.suggestions ? `
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Sugestões de Melhoria</h3>
              <p>${feedback.suggestions}</p>
            </div>
          ` : ''}
          
          <div style="color: #757575; font-size: 12px; margin-top: 20px;">
            <p>De: ${feedback.userEmail}</p>
            <p>Data: ${feedback.createdAt.toDate().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  });
