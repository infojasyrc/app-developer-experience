import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class FirebaseUploadService {
  constructor(private firebaseAdminService: FirebaseAdminService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.firebaseAdminService.getStorage().bucket();
    const filename = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(filename);

    await new Promise<void>((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (err) => reject(err));
      stream.on('finish', () => resolve());
      stream.end(file.buffer);
    });

    await fileUpload.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  }
}
