import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
    access_token: string;
  }

  interface Callbacks{
    session?: (params: { session: Session; token: JWT; user?: User })
     => Awaitable<Session | null>;
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
    expires_at: number;
  }
}
