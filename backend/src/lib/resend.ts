import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY no está definida — los emails no se enviarán')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const CONTACT_FROM_EMAIL =
    process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

export const CONTACT_TO_EMAIL =
    process.env.CONTACT_TO_EMAIL || 'jasihomedeco@gmail.com'
