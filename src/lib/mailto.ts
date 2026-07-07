interface MailtoOptions {
  to: string;
  subject: string;
  body: string;
}

export function buildMailtoHref({ to, subject, body }: MailtoOptions): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
}
