const generateWelcomeEmail = (data: {
  client: string
  email: string
  password: string
}) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Данные для входа</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
      rel="stylesheet"
    />

    <style type="text/css">
      body, table, td, a {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        font-family: 'Oswald', sans-serif;
      }
      body {
        width: 100% !important;
        height: 100% !important;
        margin: 0;
        padding: 0;
        background-color: #e9ecef;
      }
      table {
        border-collapse: collapse !important;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
    </style>
  </head>

  <body>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:600px">
            <tr>
              <td align="center" style="padding:36px 24px">
                <a href="${data.client}" target="_blank">
                  <img src="${data.client}/logo.svg" width="180" alt="PostVON" />
                </a>
              </td>
            </tr>

            <tr>
              <td bgcolor="#ffffff" style="padding:36px 24px; border-top:3px solid #d4dadf">
                <h1 style="margin:0; font-size:30px;">
                  Добро пожаловать в PostVON
                </h1>
              </td>
            </tr>

            <tr>
              <td bgcolor="#ffffff" style="padding:24px; font-size:16px;">
                <p style="margin:0;">
                  Ваш аккаунт успешно создан. Ниже указаны данные для входа:
                </p>
              </td>
            </tr>

            <!-- Блок с логином и паролем -->
            <tr>
              <td bgcolor="#ffffff" style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa; border-radius:6px;">
                  <tr>
                    <td style="padding:16px;">
                      <p style="margin:0;"><strong>Email:</strong></p>
                      <p style="margin:4px 0 12px 0;">${data.email}</p>

                      <p style="margin:0;"><strong>Пароль:</strong></p>
                      <p style="margin:4px 0 0 0;">${data.password}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Предупреждение -->
            <tr>
              <td bgcolor="#ffffff" style="padding:24px; font-size:15px;">
                <p style="margin:0;">
                  ⚠️ Рекомендуем сменить пароль сразу после первого входа в систему.
                </p>
              </td>
            </tr>

            <!-- Кнопка входа -->
            <tr>
              <td bgcolor="#ffffff" align="center" style="padding:12px 24px;">
                <a
                  href="${data.client}/login"
                  target="_blank"
                  style="
                    display:inline-block;
                    padding:16px 36px;
                    background:#1a82e2;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:16px;
                  "
                >
                  Войти в аккаунт
                </a>
              </td>
            </tr>

            <!-- Футер -->
            <tr>
              <td bgcolor="#ffffff" style="padding:24px; border-bottom:3px solid #d4dadf;">
                <p style="margin:0;">
                  С уважением,<br />
                  команда PostVON
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

export default generateWelcomeEmail
