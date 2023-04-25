import { UserRecord } from 'firebase-admin/auth';

declare module 'express-serve-static-core' {
  interface Request {
    user: UserRecord;
  }
}
