// Minimal email utilities without templates. Logs to console for now.
// TODO: integrate real email service if needed.

export async function sendPasswordResetEmail({ email, resetToken, username }: { email: string; resetToken: string; username: string; }) {
  console.log('sendPasswordResetEmail', { email, resetToken, username });
}

export async function sendVerificationEmail({ email, verificationToken, username }: { email: string; verificationToken: string; username: string; }) {
  console.log('sendVerificationEmail', { email, verificationToken, username });
}

export async function sendBugReportEmail({
  reporterEmail,
  description,
  screenshotDataUrl,
}: {
  reporterEmail: string;
  description: string;
  screenshotDataUrl?: string;
}) {
  // TODO: Replace log with real email sending and handle screenshot attachments if provided.
  console.log("sendBugReportEmail", { reporterEmail, description, screenshotDataUrl });
}
