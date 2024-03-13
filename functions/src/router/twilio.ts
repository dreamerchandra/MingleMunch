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


export const createZendutyIncident = async () => {
  await fetch('https://www.zenduty.com/api/integration/v1/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${process.env.ZENDUTY_API_KEY}`
    },
    body: JSON.stringify({
      title: 'Shop is Closed',
      service: '80dd8252-a155-4a7a-bb36-eb35bd7b3328',
      escalation_policy: '80eb1d0a-dd2c-40c9-ad9f-936f00bec855',
      summary: 'Shop is Closed',
    })
  });

}