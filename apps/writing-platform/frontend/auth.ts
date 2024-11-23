// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// // Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password"
 
// async function getUserFromDb(email: string): Promise<User | undefined> {
//     try {
//       const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
//       return user.rows[0];
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       throw new Error('Failed to fetch user.');
//     }
//   }
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       // You can specify which fields should be submitted, by adding keys to the `credentials` object.
//       // e.g. domain, username, password, 2FA token, etc.
//       credentials: {
//         email: {},
//         password: {},
//       },
//       authorize: async (credentials) => {
//         let user = null
 
//         // logic to salt and hash password
//         const pwHash = saltAndHashPassword(credentials.password)
 
//         // logic to verify if the user exists
//         user = await getUserFromDb(credentials.email, pwHash)
 
//         if (!user) {
//           // No user found, so this is their first attempt to login
//           // Optionally, this is also the place you could do a user registration
//           throw new Error("Invalid credentials.")
//         }
 
//         // return user object with their profile data
//         return user
//       },
//     }),
//   ],
// })

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';


async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
      Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);
            console.log('valid credentials')

          if (parsedCredentials.success) {
          console.log('valid credentials')

            const { email, password } = parsedCredentials.data;
            const user = await getUser(email);
            console.log("user",user)
            if (!user) return null;

            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch)  {
                    // Store the tokens in localStorage

                return {
                  ...user
                };
              }

          }
          console.log('Invalid credentials')
          return null;
        },
      }),
    ],
  });
  