import cfg from '../../config.js'
import generateConfirmEmail from './email_templates/confirmEmail.js'
import generateWelcomeEmail from './email_templates/createEmail.js'
import { sendEmail } from './index.js'

export const confEmail = async (email: string, activationCode: string) => {
  await sendEmail(
    email,
    'Подтверждение почты PostON',
    generateConfirmEmail({
      // TODO: Проверить: на какую страницу должно отправляться письмо
      link: `${cfg.CLIENT}/?secret=${activationCode}`,
      client: cfg.CLIENT,
    })
  )
}

export const welcomeEmail = async (email: string, password: string) => {
  await sendEmail(
    email,
    'Добро пожаловать в PostVON!',
    generateWelcomeEmail({
      email,
      password,
      client: cfg.CLIENT,
    })
  )
}
