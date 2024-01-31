import dotenv from 'dotenv';
import { logger } from 'firebase-functions';
import client from 'twilio';

dotenv.config();
const accountSid = 'AC8d9667b8ce34ed5473965c348b3d0d19';
const authToken = process.env.TWILIO_AUTH_TOKEN;

export const updateWhatsapp = async ({
  message,
}: {
  message: string;
}) => {
  const twilio = client(accountSid, authToken);
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return;
  }
  return twilio.messages
    .create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+916374140416'
    })
    .then((message) =>
      logger.log(`twilio whatsapp message sent ${message.sid}`)
    )
    .catch((err) =>
      logger.error(`twilio whatsapp message error ${err.message}`)
    );
};
