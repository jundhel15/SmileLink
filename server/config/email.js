import process from "node:process";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// Two ways to send, picked by what's in server/.env (or Vercel's environment variables):
// - Gmail (GMAIL_USER + GMAIL_APP_PASSWORD): free, sends to anyone, about 500 emails a day.
// - Resend (RESEND_API_KEY): used when Gmail isn't set. Without a verified domain, Resend's
//   test sender only delivers to the Resend account's own email.
const GMAIL_USER = process.env.GMAIL_USER?.trim();
// Google shows app passwords in groups of four ("abcd efgh ..."); the spaces aren't part of it
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

const gmail =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null;
const resend = !gmail && process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Gmail must send from its own address; only the display name can change
const EMAIL_FROM = gmail
  ? `SmileLink <${GMAIL_USER}>`
  : process.env.EMAIL_FROM || "SmileLink <onboarding@resend.dev>";

function escapeHtml(text) {
  return String(text ?? "").replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch],
  );
}

// Sends one email. Throws if no sender is set up or the email is rejected.
async function send(message) {
  if (gmail) {
    try {
      const info = await gmail.sendMail({ from: EMAIL_FROM, ...message });
      return { id: info.messageId, via: "gmail" };
    } catch (error) {
      throw new Error(`Gmail failed: ${error.message}`, { cause: error });
    }
  }
  if (!resend) {
    throw new Error("No email sender: set GMAIL_USER + GMAIL_APP_PASSWORD (or RESEND_API_KEY)");
  }

  const { data, error } = await resend.emails.send({ from: EMAIL_FROM, ...message });
  if (error) throw new Error(`Resend failed: ${error.message}`);
  return { ...data, via: "resend" };
}

// Sends the surprise link to the recipient.
export async function sendSmileLinkEmail({ to, recipientName, senderName, link }) {
  const recipient = escapeHtml(recipientName || "there");
  const sender = escapeHtml(senderName || "Someone");
  const safeLink = escapeHtml(link);

  return send({
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
}

// Sends the sender their own copy of the link, so they still have it if their browser is cleared.
export async function sendSenderCopyEmail({ to, senderName, recipientName, link, scheduledAt }) {
  const recipient = recipientName || "your recipient";
  const opensAt = scheduledAt
    ? new Date(scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Manila",
      })
    : "";
  const status = opensAt
    ? `The link opens on ${opensAt} (Philippine time).`
    : `We also emailed it to ${recipient}.`;

  return send({
    to,
    subject: `Your SmileLink for ${recipient} is ready`,
    text: `Hi ${senderName || "there"},\n\nYour payment was received and your surprise for ${recipient} is ready. ${status}\n\nKeep this link:\n${link}\n\n— SmileLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #3264e8;">Your SmileLink is ready</h2>
        <p>Hi ${escapeHtml(senderName || "there")},</p>
        <p>Your payment was received and your surprise for ${escapeHtml(recipient)} is ready. ${escapeHtml(status)}</p>
        <p style="margin: 28px 0;">
          <a href="${escapeHtml(link)}" style="background: #3264e8; color: #fff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold;">View the surprise</a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">Keep this link: ${escapeHtml(link)}</p>
      </div>`,
  });
}

// Tells the shop owner about a payment that needs a person. Goes to ALERT_EMAIL, or the Gmail account.
export async function sendOwnerAlertEmail({ subject, details }) {
  const to = process.env.ALERT_EMAIL?.trim() || GMAIL_USER;
  if (!to) throw new Error("No alert address: set ALERT_EMAIL");
  const lines = Object.entries(details).map(([name, value]) => `${name}: ${value}`);
  return send({
    to,
    subject: `[SmileLink alert] ${subject}`,
    text: `${subject}\n\n${lines.join("\n")}`,
  });
}
