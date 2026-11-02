import process from "node:process";
import { Resend } from "resend";

// Without a verified domain, Resend's test sender can only deliver to your own Resend account email.
const EMAIL_FROM = process.env.EMAIL_FROM || "SmileLink <onboarding@resend.dev>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(text) {
  return String(text ?? "").replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch],
  );
}

// Sends the surprise link to the recipient. Throws if Resend is not set up or rejects the email.
export async function sendSmileLinkEmail({ to, recipientName, senderName, link }) {
  if (!resend) throw new Error("RESEND_API_KEY is missing from server/.env");

  const recipient = escapeHtml(recipientName || "there");
  const sender = escapeHtml(senderName || "Someone");
  const safeLink = escapeHtml(link);

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `${senderName || "Someone"} sent you a surprise 🎉`,
    text: `Hi ${recipientName || "there"},\n\n${senderName || "Someone"} made a surprise for you. Open it here:\n${link}\n\n— SmileLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #3264e8;">You have a surprise!</h2>
        <p>Hi ${recipient},</p>
        <p>${sender} made a surprise for you on SmileLink.</p>
        <p style="margin: 28px 0;">
          <a href="${safeLink}" style="background: #3264e8; color: #fff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open my surprise</a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">Or copy this link: ${safeLink}</p>
      </div>`,
  });
  if (error) throw new Error(`Resend failed: ${error.message}`);
  return data;
}
