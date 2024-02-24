import { DecodedIdToken } from 'firebase-admin/auth';
import { Role } from './src/types/roles.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user: DecodedIdToken & { phone_number: string, role?: Role, internal?: boolean };
    userRole: Role;
  }
}
