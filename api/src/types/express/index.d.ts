import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: 'ROLE_ADMIN' | 'ROLE_USER';
      // email: string; // todo @viktor
    };
  }
}
