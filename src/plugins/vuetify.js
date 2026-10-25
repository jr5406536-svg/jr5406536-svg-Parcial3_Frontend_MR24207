import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg', color: 'secondary' },
    VTextarea: { variant: 'outlined', rounded: 'lg', color: 'secondary' },
    VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg', color: 'secondary' },
    VCard: { rounded: 'lg', elevation: 0 },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#313945',
          secondary: '#2D52A8',
          background: '#F4F7FD',
          surface: '#FFFFFF',
          error: '#EF5350',
          warning: '#FFEAA7',
          success: '#57CC99',
        },
      },
    },
  },
})
