import type { NextAuthConfig } from 'next-auth';
 
import jwt from 'jsonwebtoken';


export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Updated condition to check if the user is on the login page
      const isOnLoginPage = nextUrl.pathname.startsWith('/login'); 
      if (isOnLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/#collabDoc', nextUrl));
        }
        return true; // Allow access to the login page
      }
      const isOnDashboard = nextUrl.pathname.startsWith('/');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/#collabDoc', nextUrl));
      }
      return true;
    },
    session({ session, token, user }) {
      // `session.user.address` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
      session.user.accessToken = token
      console.log("session",session)
      console.log("token",JSON.stringify(token))
      return {
        ...session,
        user: {
          ...session.user,
        },
      }
    },
    jwt({ token, user, account, profile, isNewUser }) {
      // Initial sign in

      console.log("token",token)
      console.log("user",user)
      console.log("account",account)
      console.log("profile",profile)
      console.log("isNewUser",isNewUser)
      if (account && user) {
        console.log("In........................")  

        const jwtSecret = process.env.AUTH_SECRET || ''; // Provide a default value if JWT_SECRET is undefined
        token.accessToken = jwt.sign(
          {
            name: user.name,
            email: user.email,
            sub: user.id,
          },
          jwtSecret,
          { expiresIn: '1h' }
        );
        console.log("jwt",token)  
      }
      return token;
    },

  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;


