import type { WaitlistEntry } from './types';

export class EmailService {
  /**
   * Sends a welcome email to a new waitlist registrant
   */
  public static async sendWaitlistConfirmation(entry: WaitlistEntry): Promise<boolean> {
    // In a real implementation, this would use an email service like SendGrid, Mailchimp, etc.
    // For demonstration purposes, we'll just log the email
    
    console.log(`
--------------------------------
TO: ${entry.email}
FROM: notifications@yourdomain.com
SUBJECT: Welcome to the Language AI Waitlist!

Dear ${entry.fullName},

Thank you for joining our waitlist! We're excited to have you as one of our early users.

We're currently putting the finishing touches on our AI-powered language learning platform, and we'll notify you as soon as early access becomes available.

In the meantime, if you have any questions, feel free to reply to this email.

Best regards,
The Language AI Team
--------------------------------
    `);
    
    // In a real implementation, you would return true/false based on successful delivery
    // For now, we'll simulate a successful send
    return true;
  }
  
  /**
   * Sends an access notification to waitlist entries when they've been granted access
   */
  public static async sendAccessNotification(entries: WaitlistEntry[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = {
      success: [] as string[],
      failed: [] as string[],
    };
    
    for (const entry of entries) {
      try {
        // In a real implementation, send an actual email
        console.log(`
--------------------------------
TO: ${entry.email}
FROM: notifications@yourdomain.com
SUBJECT: Your Language AI Early Access is Ready!

Dear ${entry.fullName},

Great news! Your early access to Language AI is now available.

Please follow the link below to set up your account and start practicing your language skills with our AI-powered platform:

[SIGNUP LINK HERE]

This link is unique to you and will expire in 7 days. If you have any questions or need assistance, please reply to this email.

We're excited to have you on board!

Best regards,
The Language AI Team
--------------------------------
        `);
        
        results.success.push(entry.id);
      } catch (error) {
        console.error(`Failed to send access notification to ${entry.email}:`, error);
        results.failed.push(entry.id);
      }
    }
    
    return results;
  }
  
  /**
   * Sends a bulk email to all waitlist entries
   */
  public static async sendBulkEmail(
    entries: WaitlistEntry[],
    subject: string,
    message: string
  ): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = {
      success: [] as string[],
      failed: [] as string[],
    };
    
    for (const entry of entries) {
      try {
        // In a real implementation, send an actual email
        console.log(`
--------------------------------
TO: ${entry.email}
FROM: notifications@yourdomain.com
SUBJECT: ${subject}

Dear ${entry.fullName},

${message}

Best regards,
The Language AI Team
--------------------------------
        `);
        
        results.success.push(entry.id);
      } catch (error) {
        console.error(`Failed to send email to ${entry.email}:`, error);
        results.failed.push(entry.id);
      }
    }
    
    return results;
  }
} 