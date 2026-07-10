import Anthropic from '@anthropic-ai/sdk'

export type NotificationTemplate =
  | 'application_received'
  | 'documents_required'
  | 'application_approved'
  | 'application_rejected'
  | 'appointment_reminder'
  | 'status_update'

export interface NotificationData {
  client_name: string
  application_id?: string
  country?: string
  visa_type?: string
  appointment_date?: string
  status?: string
  custom_message?: string
  documents_needed?: string[]
}

export interface NotificationResult {
  email_sent: boolean
  email_id?: string
  error?: string
}

const client = new Anthropic()

// ---------------------------------------------------------------------------
// HTML template builders
// ---------------------------------------------------------------------------

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#2563EB;padding:28px 40px;">
              <div style="font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:1px;">&#x2708;&#xFE0F; VisaKZ</div>
              <div style="font-size:13px;color:#BFDBFE;margin-top:4px;">&#x412;&#x438;&#x437;&#x43E;&#x432;&#x44B;&#x439; &#x446;&#x435;&#x43D;&#x442;&#x440; &#x41A;&#x430;&#x437;&#x430;&#x445;&#x441;&#x442;&#x430;&#x43D;&#x430;</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:13px;color:#6B7280;">&#x421; &#x443;&#x432;&#x430;&#x436;&#x435;&#x43D;&#x438;&#x435;&#x43C;, &#x43A;&#x43E;&#x43C;&#x430;&#x43D;&#x434;&#x430; <strong>VisaKZ</strong></p>
              <p style="margin:6px 0 0;font-size:12px;color:#9CA3AF;">
                &#x260E;&#xFE0F; +7 (727) 123-45-67 &nbsp;|&nbsp; &#x1F4E7; info@visakz.kz
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#D1D5DB;">
                &#x42D;&#x442;&#x43E; &#x430;&#x432;&#x442;&#x43E;&#x43C;&#x430;&#x442;&#x438;&#x447;&#x435;&#x441;&#x43A;&#x43E;&#x435; &#x43F;&#x438;&#x441;&#x44C;&#x43C;&#x43E;. &#x41F;&#x43E;&#x436;&#x430;&#x43B;&#x443;&#x439;&#x441;&#x442;&#x430;, &#x43D;&#x435; &#x43E;&#x442;&#x432;&#x435;&#x447;&#x430;&#x439;&#x442;&#x435; &#x43D;&#x430; &#x43D;&#x435;&#x433;&#x43E;.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buttonHtml(text: string, url: string = 'https://visakz.kz/cabinet'): string {
  return `<div style="margin:28px 0 0;">
    <a href="${url}" style="display:inline-block;background:#2563EB;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">${text}</a>
  </div>`
}

function buildTemplateHtml(template: NotificationTemplate, data: NotificationData): string {
  switch (template) {
    case 'application_received': {
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x1F4CB; &#x417;&#x430;&#x44F;&#x432;&#x43A;&#x430; &#x43F;&#x440;&#x438;&#x43D;&#x44F;&#x442;&#x430;</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">
          &#x412;&#x430;&#x448;&#x430; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x430; &#x43D;&#x430; &#x432;&#x438;&#x437;&#x443; ${data.country ? `&#x432; <strong>${data.country}</strong>` : ''} &#x443;&#x441;&#x43F;&#x435;&#x448;&#x43D;&#x43E; &#x437;&#x430;&#x440;&#x435;&#x433;&#x438;&#x441;&#x442;&#x440;&#x438;&#x440;&#x43E;&#x432;&#x430;&#x43D;&#x430; &#x432; &#x43D;&#x430;&#x448;&#x435;&#x439; &#x441;&#x438;&#x441;&#x442;&#x435;&#x43C;&#x435;.
        </p>
        ${data.application_id ? `<div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:14px 18px;border-radius:4px;margin:0 0 16px;">
          <span style="font-size:13px;color:#6B7280;">&#x41D;&#x43E;&#x43C;&#x435;&#x440; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x438;:</span>
          <div style="font-size:18px;font-weight:700;color:#1D4ED8;margin-top:4px;">${data.application_id}</div>
        </div>` : ''}
        <p style="margin:0 0 8px;font-size:15px;color:#374151;">&#x41D;&#x430;&#x448; &#x43C;&#x435;&#x43D;&#x435;&#x434;&#x436;&#x435;&#x440; &#x441;&#x432;&#x44F;&#x436;&#x435;&#x442;&#x441;&#x44F; &#x441; &#x432;&#x430;&#x43C;&#x438; &#x432; &#x431;&#x43B;&#x438;&#x436;&#x430;&#x439;&#x448;&#x435;&#x435; &#x432;&#x440;&#x435;&#x43C;&#x44F; &#x434;&#x43B;&#x44F; &#x443;&#x442;&#x43E;&#x447;&#x43D;&#x435;&#x43D;&#x438;&#x44F; &#x434;&#x435;&#x442;&#x430;&#x43B;&#x435;&#x439;.</p>
        ${buttonHtml('&#x412;&#x43E;&#x439;&#x442;&#x438; &#x432; &#x43B;&#x438;&#x447;&#x43D;&#x44B;&#x439; &#x43A;&#x430;&#x431;&#x438;&#x43D;&#x435;&#x442;')}
      `
      return baseLayout('&#x417;&#x430;&#x44F;&#x432;&#x43A;&#x430; &#x43F;&#x440;&#x438;&#x43D;&#x44F;&#x442;&#x430; — VisaKZ', body)
    }

    case 'documents_required': {
      const docsList = data.documents_needed && data.documents_needed.length > 0
        ? `<ul style="margin:12px 0 16px;padding-left:20px;color:#374151;font-size:14px;">
            ${data.documents_needed.map(d => `<li style="margin-bottom:6px;">${d}</li>`).join('')}
          </ul>`
        : ''
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x1F4C4; &#x422;&#x440;&#x435;&#x431;&#x443;&#x44E;&#x442;&#x441;&#x44F; &#x434;&#x43E;&#x43F;&#x43E;&#x43B;&#x43D;&#x438;&#x442;&#x435;&#x43B;&#x44C;&#x43D;&#x44B;&#x435; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x44B;</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">
          &#x41F;&#x43E; &#x432;&#x430;&#x448;&#x435;&#x439; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x435; ${data.application_id ? `<strong>${data.application_id}</strong> ` : ''}&#x43D;&#x430;&#x43C; &#x43D;&#x435;&#x43E;&#x431;&#x445;&#x43E;&#x434;&#x438;&#x43C;&#x44B; &#x434;&#x43E;&#x43F;&#x43E;&#x43B;&#x43D;&#x438;&#x442;&#x435;&#x43B;&#x44C;&#x43D;&#x44B;&#x435; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x44B;:
        </p>
        ${docsList}
        ${data.custom_message ? `<div style="background:#FFFBEB;border-left:4px solid #F59E0B;padding:14px 18px;border-radius:4px;margin:0 0 16px;">
          <p style="margin:0;font-size:14px;color:#92400E;">${data.custom_message}</p>
        </div>` : ''}
        <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">&#x41F;&#x43E;&#x436;&#x430;&#x43B;&#x443;&#x439;&#x441;&#x442;&#x430;, &#x437;&#x430;&#x433;&#x440;&#x443;&#x437;&#x438;&#x442;&#x435; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x44B; &#x447;&#x435;&#x440;&#x435;&#x437; &#x43B;&#x438;&#x447;&#x43D;&#x44B;&#x439; &#x43A;&#x430;&#x431;&#x438;&#x43D;&#x435;&#x442; &#x438;&#x43B;&#x438; &#x43F;&#x440;&#x438;&#x43D;&#x435;&#x441;&#x438;&#x442;&#x435; &#x43E;&#x440;&#x438;&#x433;&#x438;&#x43D;&#x430;&#x43B;&#x44B; &#x432; &#x43D;&#x430;&#x448; &#x43E;&#x444;&#x438;&#x441;.</p>
        ${buttonHtml('&#x417;&#x430;&#x433;&#x440;&#x443;&#x437;&#x438;&#x442;&#x44C; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x44B;')}
      `
      return baseLayout('&#x422;&#x440;&#x435;&#x431;&#x443;&#x44E;&#x442;&#x441;&#x44F; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x44B; — VisaKZ', body)
    }

    case 'application_approved': {
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x2705; &#x412;&#x438;&#x437;&#x430; &#x43E;&#x434;&#x43E;&#x431;&#x440;&#x435;&#x43D;&#x430;!</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <div style="background:#ECFDF5;border-left:4px solid #10B981;padding:16px 20px;border-radius:4px;margin:0 0 20px;">
          <p style="margin:0;font-size:16px;font-weight:600;color:#065F46;">
            &#x1F389; &#x41F;&#x43E;&#x437;&#x434;&#x440;&#x430;&#x432;&#x43B;&#x44F;&#x435;&#x43C;! &#x412;&#x430;&#x448;&#x430; &#x432;&#x438;&#x437;&#x430; ${data.country ? `&#x432; <strong>${data.country}</strong>` : ''} &#x43E;&#x434;&#x43E;&#x431;&#x440;&#x435;&#x43D;&#x430;!
          </p>
        </div>
        ${data.application_id ? `<p style="margin:0 0 8px;font-size:14px;color:#374151;">&#x41D;&#x43E;&#x43C;&#x435;&#x440; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x438;: <strong>${data.application_id}</strong></p>` : ''}
        ${data.visa_type ? `<p style="margin:0 0 8px;font-size:14px;color:#374151;">&#x422;&#x438;&#x43F; &#x432;&#x438;&#x437;&#x44B;: <strong>${data.visa_type}</strong></p>` : ''}
        <p style="margin:16px 0 8px;font-size:15px;color:#374151;">&#x412;&#x44B; &#x43C;&#x43E;&#x436;&#x435;&#x442;&#x435; &#x437;&#x430;&#x431;&#x440;&#x430;&#x442;&#x44C; &#x432;&#x438;&#x437;&#x443; &#x432; &#x43D;&#x430;&#x448;&#x435;&#x43C; &#x43E;&#x444;&#x438;&#x441;&#x435; &#x438;&#x43B;&#x438; &#x43C;&#x44B; &#x434;&#x43E;&#x441;&#x442;&#x430;&#x432;&#x438;&#x43C; &#x435;&#x451; &#x432;&#x430;&#x43C;. &#x421;&#x432;&#x44F;&#x436;&#x438;&#x442;&#x435;&#x441;&#x44C; &#x441; &#x43D;&#x430;&#x43C;&#x438; &#x434;&#x43B;&#x44F; &#x443;&#x442;&#x43E;&#x447;&#x43D;&#x435;&#x43D;&#x438;&#x44F; &#x434;&#x435;&#x442;&#x430;&#x43B;&#x435;&#x439;.</p>
        ${data.custom_message ? `<p style="margin:12px 0;font-size:14px;color:#374151;">${data.custom_message}</p>` : ''}
        ${buttonHtml('&#x41F;&#x440;&#x43E;&#x441;&#x43C;&#x43E;&#x442;&#x440;&#x435;&#x442;&#x44C; &#x434;&#x435;&#x442;&#x430;&#x43B;&#x438;')}
      `
      return baseLayout('&#x412;&#x438;&#x437;&#x430; &#x43E;&#x434;&#x43E;&#x431;&#x440;&#x435;&#x43D;&#x430; — VisaKZ', body)
    }

    case 'application_rejected': {
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x274C; &#x41E;&#x442;&#x43A;&#x430;&#x437; &#x432; &#x432;&#x438;&#x437;&#x435;</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;padding:16px 20px;border-radius:4px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#991B1B;">
            &#x41A; &#x441;&#x43E;&#x436;&#x430;&#x43B;&#x435;&#x43D;&#x438;&#x44E;, &#x43F;&#x43E; &#x432;&#x430;&#x448;&#x435;&#x439; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x435; ${data.application_id ? `<strong>${data.application_id}</strong> ` : ''}&#x43F;&#x43E;&#x43B;&#x443;&#x447;&#x435;&#x43D; &#x43E;&#x442;&#x43A;&#x430;&#x437; ${data.country ? `&#x43D;&#x430; &#x432;&#x438;&#x437;&#x443; &#x432; <strong>${data.country}</strong>` : ''}.
          </p>
        </div>
        ${data.custom_message ? `<div style="margin:0 0 16px;"><p style="margin:0 0 4px;font-size:13px;color:#6B7280;">&#x41F;&#x440;&#x438;&#x447;&#x438;&#x43D;&#x430;:</p><p style="margin:0;font-size:14px;color:#374151;">${data.custom_message}</p></div>` : ''}
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">
          &#x41D;&#x435; &#x43E;&#x442;&#x447;&#x430;&#x438;&#x432;&#x430;&#x439;&#x442;&#x435;&#x441;&#x44C; — &#x43E;&#x442;&#x43A;&#x430;&#x437; &#x432; &#x432;&#x438;&#x437;&#x435; &#x43D;&#x435; &#x43E;&#x437;&#x43D;&#x430;&#x447;&#x430;&#x435;&#x442;, &#x447;&#x442;&#x43E; &#x441;&#x43B;&#x435;&#x434;&#x443;&#x44E;&#x449;&#x430;&#x44F; &#x43F;&#x43E;&#x43F;&#x44B;&#x442;&#x43A;&#x430; &#x431;&#x443;&#x434;&#x435;&#x442; &#x43D;&#x435;&#x443;&#x434;&#x430;&#x447;&#x43D;&#x43E;&#x439;.
          &#x41D;&#x430;&#x448;&#x438; &#x441;&#x43F;&#x435;&#x446;&#x438;&#x430;&#x43B;&#x438;&#x441;&#x442;&#x44B; &#x433;&#x43E;&#x442;&#x43E;&#x432;&#x44B; &#x43F;&#x440;&#x43E;&#x430;&#x43D;&#x430;&#x43B;&#x438;&#x437;&#x438;&#x440;&#x43E;&#x432;&#x430;&#x442;&#x44C; &#x441;&#x438;&#x442;&#x443;&#x430;&#x446;&#x438;&#x44E; &#x438; &#x43F;&#x43E;&#x43C;&#x43E;&#x447;&#x44C; &#x432;&#x430;&#x43C; &#x43F;&#x43E;&#x434;&#x433;&#x43E;&#x442;&#x43E;&#x432;&#x438;&#x442;&#x44C; &#x431;&#x43E;&#x43B;&#x435;&#x435; &#x441;&#x438;&#x43B;&#x44C;&#x43D;&#x443;&#x44E; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x443;.
        </p>
        ${buttonHtml('&#x417;&#x430;&#x43F;&#x438;&#x441;&#x430;&#x442;&#x44C;&#x441;&#x44F; &#x43D;&#x430; &#x43A;&#x43E;&#x43D;&#x441;&#x443;&#x43B;&#x44C;&#x442;&#x430;&#x446;&#x438;&#x44E;')}
      `
      return baseLayout('&#x420;&#x435;&#x448;&#x435;&#x43D;&#x438;&#x435; &#x43F;&#x43E; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x435; — VisaKZ', body)
    }

    case 'appointment_reminder': {
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x1F5D3; &#x41D;&#x430;&#x43F;&#x43E;&#x43C;&#x438;&#x43D;&#x430;&#x43D;&#x438;&#x435; &#x43E; &#x432;&#x441;&#x442;&#x440;&#x435;&#x447;&#x435;</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">
          &#x41D;&#x430;&#x43F;&#x43E;&#x43C;&#x438;&#x43D;&#x430;&#x435;&#x43C; &#x43E; &#x432;&#x430;&#x448;&#x435;&#x439; &#x437;&#x430;&#x43F;&#x438;&#x441;&#x438; &#x432; &#x432;&#x438;&#x437;&#x43E;&#x432;&#x44B;&#x439; &#x446;&#x435;&#x43D;&#x442;&#x440; VisaKZ.
        </p>
        <div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:16px 20px;border-radius:4px;margin:0 0 20px;">
          ${data.appointment_date ? `<p style="margin:0 0 4px;font-size:13px;color:#6B7280;">&#x414;&#x430;&#x442;&#x430; &#x438; &#x432;&#x440;&#x435;&#x43C;&#x44F;:</p>
          <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#1D4ED8;">${data.appointment_date}</p>` : ''}
          ${data.application_id ? `<p style="margin:0;font-size:13px;color:#374151;">&#x417;&#x430;&#x44F;&#x432;&#x43A;&#x430;: <strong>${data.application_id}</strong></p>` : ''}
        </div>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;">
          &#x1F4CD; &#x410;&#x434;&#x440;&#x435;&#x441;: &#x433;. &#x410;&#x43B;&#x43C;&#x430;&#x442;&#x44B;, &#x443;&#x43B;. &#x410;&#x431;&#x430;&#x44F; 150, &#x43E;&#x444;&#x438;&#x441; 201
        </p>
        <p style="margin:0 0 16px;font-size:14px;color:#6B7280;">
          &#x41F;&#x440;&#x438; &#x441;&#x435;&#x431;&#x435; &#x43D;&#x435;&#x43E;&#x431;&#x445;&#x43E;&#x434;&#x438;&#x43C;&#x43E; &#x438;&#x43C;&#x435;&#x442;&#x44C; &#x432;&#x441;&#x435; &#x43E;&#x440;&#x438;&#x433;&#x438;&#x43D;&#x430;&#x43B;&#x44B; &#x434;&#x43E;&#x43A;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x43E;&#x432;. &#x415;&#x441;&#x43B;&#x438; &#x432;&#x44B; &#x43D;&#x435; &#x43C;&#x43E;&#x436;&#x435;&#x442;&#x435; &#x43F;&#x440;&#x438;&#x439;&#x442;&#x438;, &#x43F;&#x43E;&#x436;&#x430;&#x43B;&#x443;&#x439;&#x441;&#x442;&#x430;, &#x43F;&#x440;&#x435;&#x434;&#x443;&#x43F;&#x440;&#x435;&#x434;&#x438;&#x442;&#x435; &#x43D;&#x430;&#x441; &#x437;&#x430;&#x440;&#x430;&#x43D;&#x435;&#x435;.
        </p>
        ${buttonHtml('&#x41F;&#x43E;&#x434;&#x442;&#x432;&#x435;&#x440;&#x434;&#x438;&#x442;&#x44C; &#x432;&#x438;&#x437;&#x438;&#x442;')}
      `
      return baseLayout('&#x41D;&#x430;&#x43F;&#x43E;&#x43C;&#x438;&#x43D;&#x430;&#x43D;&#x438;&#x435; &#x43E; &#x432;&#x441;&#x442;&#x440;&#x435;&#x447;&#x435; — VisaKZ', body)
    }

    case 'status_update': {
      const body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">&#x1F504; &#x41E;&#x431;&#x43D;&#x43E;&#x432;&#x43B;&#x435;&#x43D;&#x438;&#x435; &#x441;&#x442;&#x430;&#x442;&#x443;&#x441;&#x430; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x438;</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">&#x417;&#x434;&#x440;&#x430;&#x432;&#x441;&#x442;&#x432;&#x443;&#x439;&#x442;&#x435;, <strong>${data.client_name}</strong>!</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">
          &#x41F;&#x43E; &#x432;&#x430;&#x448;&#x435;&#x439; &#x437;&#x430;&#x44F;&#x432;&#x43A;&#x435; ${data.application_id ? `<strong>${data.application_id}</strong> ` : ''}&#x435;&#x441;&#x442;&#x44C; &#x43E;&#x431;&#x43D;&#x43E;&#x432;&#x43B;&#x435;&#x43D;&#x438;&#x435;.
        </p>
        ${data.status ? `<div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:14px 18px;border-radius:4px;margin:0 0 16px;">
          <span style="font-size:13px;color:#6B7280;">&#x422;&#x435;&#x43A;&#x443;&#x449;&#x438;&#x439; &#x441;&#x442;&#x430;&#x442;&#x443;&#x441;:</span>
          <div style="font-size:16px;font-weight:700;color:#1D4ED8;margin-top:4px;">${data.status}</div>
        </div>` : ''}
        ${data.custom_message ? `<p style="margin:0 0 16px;font-size:15px;color:#374151;">${data.custom_message}</p>` : ''}
        ${buttonHtml('&#x41F;&#x43E;&#x441;&#x43C;&#x43E;&#x442;&#x440;&#x435;&#x442;&#x44C; &#x432; &#x43B;&#x438;&#x447;&#x43D;&#x43E;&#x43C; &#x43A;&#x430;&#x431;&#x438;&#x43D;&#x435;&#x442;&#x435;')}
      `
      return baseLayout('&#x41E;&#x431;&#x43D;&#x43E;&#x432;&#x43B;&#x435;&#x43D;&#x438;&#x435; &#x441;&#x442;&#x430;&#x442;&#x443;&#x441;&#x430; — VisaKZ', body)
    }
  }
}

function getEmailSubject(template: NotificationTemplate, data: NotificationData): string {
  switch (template) {
    case 'application_received':
      return `Заявка принята${data.country ? ` — ${data.country}` : ''} | VisaKZ`
    case 'documents_required':
      return `Требуются документы по заявке ${data.application_id ?? ''} | VisaKZ`
    case 'application_approved':
      return `✅ Виза одобрена! ${data.country ? `— ${data.country}` : ''} | VisaKZ`
    case 'application_rejected':
      return `Решение по заявке ${data.application_id ?? ''} | VisaKZ`
    case 'appointment_reminder':
      return `Напоминание о встрече ${data.appointment_date ?? ''} | VisaKZ`
    case 'status_update':
      return `Обновление по заявке ${data.application_id ?? ''} | VisaKZ`
  }
}

// ---------------------------------------------------------------------------
// AI-personalized email generator
// ---------------------------------------------------------------------------

export async function generatePersonalizedEmail(
  template: NotificationTemplate,
  data: NotificationData
): Promise<string> {
  const templateNames: Record<NotificationTemplate, string> = {
    application_received: 'Заявка принята',
    documents_required: 'Требуются документы',
    application_approved: 'Виза одобрена',
    application_rejected: 'Отказ в визе',
    appointment_reminder: 'Напоминание о встрече',
    status_update: 'Обновление статуса',
  }

  const systemPrompt = `Ты — копирайтер визового центра VisaKZ. Пиши тёплые, профессиональные письма на русском языке.
Возвращай ТОЛЬКО HTML-фрагмент тела письма (без <html>, <head>, <body> тегов).
Используй inline-стили для форматирования. Цвет бренда: #2563EB.
Текст должен быть личным, заботливым и обнадёживающим.`

  const userPrompt = `Напиши тело email-письма для шаблона "${templateNames[template]}".
Данные клиента:
- Имя: ${data.client_name}
${data.country ? `- Страна: ${data.country}` : ''}
${data.visa_type ? `- Тип визы: ${data.visa_type}` : ''}
${data.application_id ? `- Номер заявки: ${data.application_id}` : ''}
${data.appointment_date ? `- Дата встречи: ${data.appointment_date}` : ''}
${data.status ? `- Статус: ${data.status}` : ''}
${data.custom_message ? `- Дополнительное сообщение: ${data.custom_message}` : ''}
${data.documents_needed?.length ? `- Нужные документы: ${data.documents_needed.join(', ')}` : ''}

Сделай письмо дружелюбным и персонализированным.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  // Strip potential markdown code fences
  return raw.replace(/```(?:html)?\n?/g, '').trim()
}

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------

export async function sendNotification(
  to_email: string,
  template: NotificationTemplate,
  data: NotificationData
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[notification-agent] RESEND_API_KEY is not set — email not sent')
    return { email_sent: false, error: 'No API key' }
  }

  const html = buildTemplateHtml(template, data)
  const subject = getEmailSubject(template, data)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'VisaKZ <noreply@visakz.kz>',
        to: [to_email],
        subject,
        html,
      }),
    })

    const body = await response.json() as { id?: string; name?: string; message?: string }

    if (!response.ok) {
      const errMsg = body.message ?? body.name ?? `HTTP ${response.status}`
      console.error('[notification-agent] Resend API error:', errMsg)
      return { email_sent: false, error: errMsg }
    }

    return { email_sent: true, email_id: body.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[notification-agent] fetch error:', msg)
    return { email_sent: false, error: msg }
  }
}
