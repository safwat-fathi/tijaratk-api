declare global {
  namespace Express {
    interface User {
      email?: string;
      facebookId: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
