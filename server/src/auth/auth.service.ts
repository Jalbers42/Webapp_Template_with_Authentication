import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DecodedJwtToken } from 'src/shared/types';

@Injectable()
export class AuthService {

    constructor(private firebaseService: FirebaseService) {}

    async register_user(email: string, password: string, username: string) {
        const is_username_available: boolean = await this.firebaseService.is_username_available(username)
        if (!is_username_available)
            throw new Error("Username is unavailable.");

        const user_credential = await this.firebaseService.create_user(email, password, username)
        return {user_credential};
    }

    async reset_password_with_username_or_email(email_or_username: string) {
        let user_email: string | null = null

        if (email_or_username.includes('@'))
            user_email = email_or_username
        else {
            const username = email_or_username
            user_email = await this.firebaseService.get_email_from_username(username)
        }
        await this.firebaseService.generate_password_reset_link(user_email)
        return user_email
    }

    async sync_user_with_database(request: Request) {
        const decoded_jwt_token: DecodedJwtToken = request['decoded_jwt_token']
        const is_new_user: boolean = !(await this.firebaseService.is_user_stored_in_db(decoded_jwt_token.uid))
        if (is_new_user) {
            await this.firebaseService.store_user_in_db(decoded_jwt_token)
        }
        return is_new_user
    }

    async delete_user(request: Request) {
        const decoded_jwt_token: DecodedJwtToken = request['decoded_jwt_token'];
        await this.firebaseService.delete_user_from_firebase_auth(decoded_jwt_token.uid);
        await this.firebaseService.delete_user_from_db(decoded_jwt_token.uid);
    }

    async edit_username(request: Request, new_username) {
        const decoded_jwt_token: DecodedJwtToken = request['decoded_jwt_token'];
        const user_uid = decoded_jwt_token.uid;

        const is_username_available: boolean = await this.firebaseService.is_username_available(new_username);
        if (!is_username_available) {
            throw new Error("Username is unavailable.");
        }

        await this.firebaseService.update_username_in_auth(user_uid, new_username);
        await this.firebaseService.update_username_in_db(user_uid, new_username);

        return { message: "Username changed successfully" };
    }
}