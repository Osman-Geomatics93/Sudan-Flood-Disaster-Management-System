/**
 * SMS Gateway Service - Provider abstraction
 * Supports Twilio and Africa's Talking as SMS providers
 */

export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }>;
  sendBulkSMS(
    recipients: string[],
    message: string,
  ): Promise<{ success: boolean; sent: number; failed: number }>;
}

class TwilioSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string) {
    // Twilio integration stub - implement when TWILIO_ACCOUNT_SID is available
    console.log(`[Twilio] Sending SMS to ${to}: ${message.slice(0, 50)}...`);
    return { success: true, messageId: `twilio-${Date.now()}` };
  }

  async sendBulkSMS(recipients: string[], message: string) {
    let sent = 0;
    let failed = 0;
    for (const to of recipients) {
      const result = await this.sendSMS(to, message);
      result.success ? sent++ : failed++;
    }
    return { success: failed === 0, sent, failed };
  }
}

class AfricasTalkingSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string) {
    // Africa's Talking integration stub
    console.log(`[AT] Sending SMS to ${to}: ${message.slice(0, 50)}...`);
    return { success: true, messageId: `at-${Date.now()}` };
  }

  async sendBulkSMS(recipients: string[], message: string) {
    let sent = 0;
    let failed = 0;
    for (const to of recipients) {
      const result = await this.sendSMS(to, message);
      result.success ? sent++ : failed++;
    }
    return { success: failed === 0, sent, failed };
  }
}

export function createSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || 'twilio';
  switch (provider) {
    case 'africastalking':
      return new AfricasTalkingSMSProvider();
    case 'twilio':
    default:
      return new TwilioSMSProvider();
  }
}

const smsProvider = createSMSProvider();

export async function sendAlertSMS(phone: string, message: string) {
  return smsProvider.sendSMS(phone, message);
}

export async function sendBulkAlertSMS(phones: string[], message: string) {
  return smsProvider.sendBulkSMS(phones, message);
}
