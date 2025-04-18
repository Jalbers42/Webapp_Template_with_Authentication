import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketModule } from './socket/socket.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
    imports: [
        SocketModule,
        EventEmitterModule.forRoot(),
        FirebaseModule,
        AuthModule,
    ],
    controllers: [
        AppController
    ],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        },
        Reflector
    ],
})
export class AppModule {}
