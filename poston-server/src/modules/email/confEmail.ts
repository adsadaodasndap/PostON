import nodemailer from 'nodemailer'
import cfg from '../../config'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: cfg.GOOGLE_USER,
    pass: cfg.GOOGLE_APP_PASSWORD,
  },
})

export async function confEmail(to: string, code: string) {
  const mailOptions = {
    from: cfg.GOOGLE_USER,
    to,
    subject: 'Подтверждение почты на PostON',
    text: `Ваш код подтверждения: ${code}`,
  }
  await transporter.sendMail(mailOptions)
}
