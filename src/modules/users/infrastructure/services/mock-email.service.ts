export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export class MockEmailService implements IEmailService {
  public async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[MockEmailService] Sending email...`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    console.log(`[MockEmailService] Email successfully sent to ${to}`);
  }
}

export const mockEmailService = new MockEmailService();
