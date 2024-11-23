import { AuthService as SharedAuthService } from '@auth';

export class AuthService extends SharedAuthService {
    async authenticateUser(event: any): Promise<any> {
        // Additional checks or modifications specific to the writing platform
        try{
            const token = this.extractTokenFromEvent(event);
            if (!token) {
                throw new Error('No token provided');
            }
            const user = await this.verifyToken(token);
            if (!user || !this.hasPlatformAccess(user)) {
                throw new Error('Access denied');
            }
            return user;
        }catch(error){
            console.error('Failed to authenticate user:', error);
            throw new Error('Failed to authenticate user.');
        }       
    }
}