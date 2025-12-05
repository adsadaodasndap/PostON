import nodemailer from 'nodemailer'
import cfg from '../../config.js'

export const confEmail = async (
  recipientEmail: string,
  activationCode: string
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: cfg.GOOGLE_USER,
      pass: cfg.GOOGLE_APP_PASSWORD,
    },
  })
  const mailOptions = {
    from: cfg.GOOGLE_USER,
    to: recipientEmail,
    subject: 'Подтверждение почты PostON',
    text: `Ваш код подтверждения: ${activationCode}`,
  }
  await transporter.sendMail(mailOptions)
}
