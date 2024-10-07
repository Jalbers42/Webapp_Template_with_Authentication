import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    getHello(): string {
        return 'Hello from chat module';
    }
}
