import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {

    constructor(private firebaseService: FirebaseService) {}

    async register_user(email: string, password: string, username: string) {
        const is_username_available: boolean = await this.firebaseService.is_username_available(username)
        if (is_username_available)
            throw new Error("Username is unavailable.");

        const userCredential = await this.firebaseService.create_user(email, password, username)
        return userCredential;
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
        return `Password reset email sent to: ${user_email}`;
    }

    // async sync_user_with_database() {

    // }
}
