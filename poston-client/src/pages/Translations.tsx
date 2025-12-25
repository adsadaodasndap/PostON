import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useUser } from '../context/user/useUser'

const Translations = () => {
  const { t, i18n } = useTranslation()
  const { user } = useUser()

  const langs = [
    { v: 'kz', l: t('lang_kz') },
    { v: 'ru', l: t('lang_ru') },
    { v: 'en', l: t('lang_en') },
  ] as const

  const handleLangChange = (e: SelectChangeEvent<string>) => {
    void i18n.changeLanguage(e.target.value)
  }

  const email = user?.email ?? ''
  const tgId = user?.tg_id ?? ''

  return (
    <Paper sx={{ p: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="lang-select-label">{t('trans.title')}</InputLabel>

        <Select
          labelId="lang-select-label"
          value={i18n.language}
          label={t('trans.title')}
          onChange={handleLangChange}
        >
          {langs.map((lang) => (
            <MenuItem key={lang.v} value={lang.v}>
              <img
                height={15}
                alt={lang.v}
                src={`images/flags/${lang.v}.svg`}
                style={{ marginRight: 5 }}
              />
              {lang.l}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h4">{t('hello')}</Typography>
      <Typography variant="h4">{t('title.one')}</Typography>
      <Typography variant="h4">{t('title.two')}</Typography>
      <Typography variant="h4">{t('title.three')}</Typography>
      <Typography variant="h4">{t('subtitle')}</Typography>
      <Typography variant="h4">{t('good.evening')}</Typography>

      <Typography>{t('imputation', { email, id: tgId })}</Typography>
      <Typography>{t('imputation2', { user: user ?? null })}</Typography>
    </Paper>
  )
}

export default Translations
