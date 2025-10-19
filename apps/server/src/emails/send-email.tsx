import { Resend } from "resend";
import { RESEND_API_KEY } from "../config/env";

type EmailParams = {
  to: string;
  subject: string;
  text: string;
};

const resend = new Resend(RESEND_API_KEY!);

// Sends plain text emails using Resend
export async function sendEmail({ to, subject, text }: EmailParams) {
  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // change this for production
      to,
      subject,
      text,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
