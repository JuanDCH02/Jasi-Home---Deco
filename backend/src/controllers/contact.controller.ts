import { Request, Response } from 'express'
import { contactSchema } from '../schemas/contact.schema'
import { resend, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } from '../lib/resend'

const escapeHtml = (str: string) =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

export const sendContact = async (req: Request, res: Response) => {
    const parsed = contactSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Datos inválidos',
            issues: parsed.error.issues.map(i => ({ path: i.path, message: i.message })),
        })
    }

    const { name, email, phone, message } = parsed.data
    const safe = {
        name: escapeHtml(name),
        email: escapeHtml(email),
        phone: phone ? escapeHtml(phone) : '',
        message: escapeHtml(message).replace(/\n/g, '<br/>'),
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `JasiHome Contacto <${CONTACT_FROM_EMAIL}>`,
            to: [CONTACT_TO_EMAIL],
            replyTo: email,
            subject: `Nueva consulta de ${name}`,
            html: `
                <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
                    <h2 style="color: #b5922a; margin-bottom: 8px;">Nueva consulta desde JasiHome</h2>
                    <p style="color: #78716c; margin-top: 0;">Recibiste un mensaje desde el formulario de contacto.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                        <tr><td style="padding: 8px 0; color: #78716c; width: 100px;">Nombre</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
                        <tr><td style="padding: 8px 0; color: #78716c;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
                        ${safe.phone ? `<tr><td style="padding: 8px 0; color: #78716c;">Teléfono</td><td style="padding: 8px 0;">${safe.phone}</td></tr>` : ''}
                    </table>
                    <div style="margin-top: 20px; padding: 16px; background: #f5f5f4; border-left: 3px solid #b5922a; border-radius: 4px;">
                        <p style="margin: 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mensaje</p>
                        <p style="margin: 8px 0 0; line-height: 1.6;">${safe.message}</p>
                    </div>
                </div>
            `,
        })

        if (error) {
            console.error('❌ Resend error:', error)
            return res.status(502).json({ error: 'No pudimos enviar tu consulta, intentá de nuevo' })
        }

        console.log('📩 Consulta enviada:', data?.id)
        return res.json({ message: 'Consulta recibida, te contactamos pronto' })
    } catch (err) {
        console.error('❌ Error inesperado enviando contacto:', err)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}
