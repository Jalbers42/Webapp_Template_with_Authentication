import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DISABLE_AUTH_KEY } from 'src/shared/disable-auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const is_auth_disabled = this.reflector.getAllAndOverride<boolean>(DISABLE_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (is_auth_disabled)
            return true;

        const authorization = request.headers['authorization'];

        if (!authorization)
            throw new UnauthorizedException('Authorization header is missing');

        if (!authorization.startsWith('Bearer '))
            throw new UnauthorizedException('Invalid token format. Expected format: Bearer <token>');

        const token = authorization.replace('Bearer ', '');

        if (!token)
            throw new UnauthorizedException('Token missing');

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            request['user'] = decodedToken;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
