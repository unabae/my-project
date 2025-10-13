interface EmailTemplateProps {
  firstName: string;
  url: string;
}

export function EmailTemplate({ firstName, url }: EmailTemplateProps): string {
  return `
Welcome, ${firstName}!

Please verify your email address by clicking the link below:

${url}

If you didn't sign up for this account, you can safely ignore this email.
`;
}
