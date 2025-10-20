import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
    access_token: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
  }
}
