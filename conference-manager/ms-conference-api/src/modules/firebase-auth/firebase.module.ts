import { Logger, Module } from '@nestjs/common'
import { FirebaseAdminService } from './firebase-admin.service'
import { FirebaseAuthStrategy } from './firebase-auth.strategy'
import { FirebaseUploadService } from './firebase-upload-file.service'

@Module({
  imports: [],
  controllers: [],
  providers: [Logger, FirebaseAdminService, FirebaseAuthStrategy, FirebaseUploadService],
  exports: [FirebaseAdminService, FirebaseUploadService],
})
export class FirebaseModule {}
