import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions =({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                try {
                

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials?.email,
                        password: credentials?.password,
                    })
                });

                if (!res.ok) {
                      const errorData = await res.json();
                    let errorMessage = 'Login failed'; // Default message
                    if (errorData.detail) {
                        if (typeof errorData.detail === 'string') {
                            errorMessage = errorData.detail;
                        } else if (Array.isArray(errorData.detail)) {
                            // Format array of validation errors
                            errorMessage = errorData.detail.map((err: { msg?: string }) => err.msg || JSON.stringify(err)).join(', ');
                        } else if (typeof errorData.detail === 'object') {
                            // Handle a single error object
                            errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
                        }
                    }
                    throw new Error(errorMessage);
                }
                    
                const data = await res.json();
                return { id: data.user.id, name: data.user.name, email: data.user.email, access_token: data.access_token };
                } catch (error) {
                    console.error('Error during authorization:', error);
                    throw new Error('Server not reachable' );
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.access_token = user.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = session.user || {};
            session.access_token = token.access_token;
            return session;
        },
    },
});

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };