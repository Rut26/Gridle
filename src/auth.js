import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google'

export const {
    handlers :  {GET, POST},
    auth,
    signIn,
    signOut,
}  = NextAuth({
        providers : [
            GoogleProvider({
                clientId : process.env.CLIENT_ID,
                clientSecret : process.env.CLIENT_SECRET,

                authorization : {
                    prompt : "consent",
                    access_type : "offline",
                    response_type : "code",
                }
            })
        ]
})