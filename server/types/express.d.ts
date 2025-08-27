import 'express';

declare module 'express' {
  interface Request {
    auth?: any;
  }
}