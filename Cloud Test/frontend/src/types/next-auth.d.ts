import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
    access_token: string;
  }

  interface User extends DefaultUser {
    role: string;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    access_token: string;
  }
}
