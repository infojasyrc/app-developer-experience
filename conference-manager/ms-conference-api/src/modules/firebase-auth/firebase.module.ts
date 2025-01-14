import { Logger, Module } from '@nestjs/common'
import { FirebaseAdminService } from './firebase-admin.service';
import { FirebaseUploadService } from './firebase-upload-file.service';

@Module({
  imports: [],
  controllers: [],
  providers: [Logger, FirebaseAdminService, FirebaseUploadService],
  exports: [FirebaseModule],
})
export class FirebaseModule {}
