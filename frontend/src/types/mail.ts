export interface SmtpConfig {
  id: string;
  establishmentId: string;
  host: string;
  port: number;
  user: string;
  fromName: string;
  fromEmail: string;
  isSecure: boolean;
  isDefault: boolean;
  resendApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendMailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
