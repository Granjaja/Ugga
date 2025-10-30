import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
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
                        let errorMessage = 'Login failed';
                        if (errorData.detail) {
                            if (typeof errorData.detail === 'string') {
                                errorMessage = errorData.detail;
                            } else if (Array.isArray(errorData.detail)) {
                                errorMessage = errorData.detail.map((err: { msg?: string }) => err.msg || JSON.stringify(err)).join(', ');
                            } else if (typeof errorData.detail === 'object') {
                                errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    const user = await res.json();
                    return { id: user.user.id, name: user.user.name, email: user.user.email, access_token: user.access_token, role: user.user.role };
                } catch (error) {
                    console.error('Error during authorization:', error);
                    throw new Error( error instanceof Error ? error.message : 'An unknown error occurred' );
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 60 minutes
    },
    secret: process.env.NEXTAUTH_SECRET,
    
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.access_token = user.access_token;
                token.role = user.role;
                token.expires_at = Date.now() + 60 * 60 * 1000
            }
            if (Date.now() > token.expires_at) {
                token.access_token = '';
                token.role = '';
                token.expires_at = 0;
            }
            return token;
        },
        async session({ session, token }) {
            
            if (!token.access_token){
                
            }
            session.access_token = token.access_token;
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        },
    },
};