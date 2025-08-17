import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/mongodb";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials.email });
                    
                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await user.comparePassword(credentials.password);
                    
                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
            GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
                }
            })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    await connectDB();
                    const existingUser = await User.findOne({ email: user.email });
                    
                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            googleId: user.id,
                            image: user.image,
                            emailVerified: new Date(),
                        });
                    }
                } catch (error) {
                    console.error("Error saving user:", error);
                    return false;
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/signin',
        signUp: '/signup',
    },
});