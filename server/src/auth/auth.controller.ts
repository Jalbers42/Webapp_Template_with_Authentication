import { Body, Controller, Delete, Headers, HttpException, HttpStatus, Post, Put, Req } from '@nestjs/common';
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
            const user_credential = await this.authService.register_user(body.email, body.password, body.username);
            console.log('User registered successfully, user: ', user_credential);
            return { message: "User successfully created", user_credential }
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
    async sync_user_with_database(@Req() request: Request) {
        try {
            const is_new_user = await this.authService.sync_user_with_database(request)
            console.log("sync_user_with_database success. is_new_user=", is_new_user);
            return { message: "User successfully synced with db", is_new_user }
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

    @Delete('delete-user')
    async delete_user(@Req() request: Request) {
        try {
            await this.authService.delete_user(request);
            console.log('User deleted successfully, user: ', request['decoded_jwt_token']);
            return { message: 'User deleted successfully' };
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

    @Put('edit-username')
    async edit_username(
        @Req() request: Request,
        @Body() body: { new_username: string},
    ) {
        try {
            await this.authService.edit_username(request, body.new_username);
            console.log('Username updated. New username: ', body.new_username, ' user: ', request['decoded_jwt_token']);
            return { message: 'Username changed successfully' };
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

}

