import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendMailProps) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail kimlik bilgileri bulunamadı, mail gönderilemiyor.");
    return { error: "Gmail credentials missing" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Iftar Match" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Mail Unexpected Error:", error);
    return { error };
  }
}

// --- Şablonlar ---

export function getNewInvitationEmailHtml(hostName: string, dateStr: string, groupName: string) {
  return `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #059669; margin-bottom: 20px;">🌙 Yeni İftar Daveti!</h2>
      <p>Merhaba <strong>${groupName}</strong> sorumlusu,</p>
      <p><strong>${hostName}</strong> sizi <strong>${dateStr}</strong> tarihinde iftar sofrasına davet etti.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Tarih:</strong> ${dateStr}</p>
        <p style="margin: 0;"><strong>Davet Eden:</strong> ${hostName}</p>
      </div>
      <p>Daveti onaylamak veya reddetmek için <a href="https://iftarmee.vercel.app/login" style="color: #059669; font-weight: bold; text-decoration: none;">yönetici paneline giriş yapabilirsiniz.</a></p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">Bu e-posta Iftar Match sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    </div>
    `;
}

export function getInvitationAcceptedEmailHtml(hostName: string, dateStr: string, groupName: string) {
  return `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #059669; margin-bottom: 20px;">✅ Davetiniz Kabul Edildi!</h2>
      <p>Merhaba <strong>${hostName}</strong>,</p>
      <p><strong>${dateStr}</strong> tarihi için <strong>${groupName}</strong> grubuna yaptığınız iftar daveti kabul edildi.</p>
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #10b981;">
        <p style="margin: 0; color: #065f46;"><strong>Durum:</strong> Onaylandı</p>
        <p style="margin: 0; color: #065f46;"><strong>Grup:</strong> ${groupName}</p>
        <p style="margin: 0; color: #065f46;"><strong>Tarih:</strong> ${dateStr}</p>
      </div>
      <p>Şimdiden hayırlı iftarlar dileriz.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">Bu e-posta Iftar Match sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    </div>
    `;
}

export function getInvitationRejectedEmailHtml(hostName: string, dateStr: string, groupName: string, reason: string) {
  return `
    <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #dc2626; margin-bottom: 20px;">❌ Davet Hakkında Bilgilendirme</h2>
      <p>Merhaba <strong>${hostName}</strong>,</p>
      <p><strong>${dateStr}</strong> tarihi için <strong>${groupName}</strong> grubuna yaptığınız iftar daveti maalesef şu an belirlenen kriterlere uygun olmadığı için reddedildi.</p>
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="margin: 0; color: #991b1b;"><strong>Mesaj:</strong> ${reason}</p>
      </div>
      <p>Başka bir tarih için tekrar davet oluşturabilirsiniz.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">Bu e-posta Iftar Match sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    </div>
    `;
}
