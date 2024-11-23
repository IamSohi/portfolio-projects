import jwt from 'jsonwebtoken';

export class AuthService {
    async verifyToken(token: string): Promise<any> {
        try {

            console.log("token:.................",token)

            const decoded = jwt.verify(token, "0mFG1LbFHQnTIFFHAw5iM5jwAJVoxb3OxlDLkL+rVqo="); // Verify using your secret key
            console.log("decoded",decoded)
            // The decoded token should contain the user's information (e.g., user ID, username)
            return decoded;  // Return user info or null if verification fails

        } catch (error) {
            // Token is invalid or expired
            console.error("Token verification failed:", error);
            return null; 
        }
    }
    extractTokenFromEvent(event: any): string {
        // Extract the token from the event object
        return event.headers.Authorization;
    }
    hasPlatformAccess(user: any): boolean {
        // Custom access logic for the writing platform
        return true;
    }

}
