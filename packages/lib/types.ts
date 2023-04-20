/**
 * For complete documentation on the Mailchannels API, see:
 * https://api.mailchannels.net/tx/v1/documentation
 */
export interface MailchannelsBody {
  personalizations: {
    to: {
      email: string;
      name?: string;
    }[];
    reply_to?: {
      email: string;
      name?: string;
    };
    cc?: {
      email: string;
      name?: string;
    }[];
    bcc?: {
      email: string;
      name?: string;
    }[];
  }[];
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  content: {
    type: string;
    value: string;
  }[];
}

export interface Env {
  R2_BUCKET: R2Bucket;
  D1_DATABASE: D1Database;
}
