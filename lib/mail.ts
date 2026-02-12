import { Resend } from "resend";

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

// Resend nesnesini her çağrıda oluşturmak yerine sadece ihtiyaç duyulduğunda oluşturacağız
export async function sendEmail({ to, subject, html }: SendMailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY bulunamadı, mail gönderilemiyor.");
    return { error: "API Key missing" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: "Iftar Match <onboarding@resend.dev>", // Alan adınız yoksa bu kalmalı
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Mail Error:", error);
      return { error };
    }

    return { success: true, data };
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
      <p>Daveti onaylamak veya reddetmek için yönetici paneline giriş yapabilirsiniz.</p>
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
