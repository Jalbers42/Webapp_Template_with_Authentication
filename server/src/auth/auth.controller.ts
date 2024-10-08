import { Body, Controller, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthService } from './auth.service';
import { DisableAuth } from 'src/shared/disable-auth.decorator';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register')
    @DisableAuth()
    async register_user(@Body() body: { email: string, password: string, username: string }) {
        try {
            return await this.authService.register_user(body.email, body.password, body.username);
        } catch (error) {
            console.log(error.message);
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('reset-password')
    async reset_password_with_username_or_email(@Body() body: { email_or_username: string}) {
        try {
            return await this.authService.reset_password_with_username_or_email(body.email_or_username);
        } catch (error) {
            console.log(error.message);
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('sync-user-with-database')
    async sync_user_with_database(@Headers('Authorization') authorization: string) {
    }

}

