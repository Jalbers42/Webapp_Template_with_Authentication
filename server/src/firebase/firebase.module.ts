// src/firebase/firebase.module.ts
import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

// @Global()  // Making the module global (optional)
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
  controllers: [],
})
export class FirebaseModule {}