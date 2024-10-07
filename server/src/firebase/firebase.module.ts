// src/firebase/firebase.module.ts
import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';

// @Global()  // Making the module global (optional)
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
  controllers: [FirebaseController],
})
export class FirebaseModule {}