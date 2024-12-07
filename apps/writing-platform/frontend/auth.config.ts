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
      if (!isLoggedIn) {
        return false;
      }
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
      console.log("session",session)
      console.log("token",token)
      console.log("user",user)
      console.log("token",JSON.stringify(token))
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.accessToken = token
      }
      return session;
      
    },
    jwt({ token, user, account, profile, isNewUser }) {
      console.log("token",token)
      console.log("user",user)
      console.log("account",account)
      console.log("profile",profile)
      console.log("isNewUser",isNewUser)
      if (account && user) {
        console.log("In........................")  
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
  
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
      }
      return token;
    },

  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;


