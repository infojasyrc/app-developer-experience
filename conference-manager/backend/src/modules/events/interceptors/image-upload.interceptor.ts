import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, BadRequestException } from '@nestjs/common';
import  multer from 'multer';
import { Observable } from 'rxjs';
import { FirebaseUploadService } from '../../firebase-auth/firebase-upload-file.service';

export interface Response<T> {
  status: HttpStatus;
  data: T;
}

@Injectable()
export class ImageUploadInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly uploadService: FirebaseUploadService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    return new Observable((observer) => {
      const upload = multer().any();

      // Invoke multer and handle the callback in asynchronous way
      upload(request, null, async (err: any) => {
        if (err) {
          observer.error(err)
        } else {
          const file = request.files[0]
          if (request.files.length > 0 ) {
            try {
              request.body = {image: file, userId: request.user.userId, ...request.body}
              return this.subscribeToHandle(next, observer)
            } catch (error) {
              observer.error(error)
            }
          }
          request.body = { userId: request.user.userId, ...request.body }
          return this.subscribeToHandle(next, observer)
        }
      });
    });
  }

  async subscribeToHandle(next: any, observer: any) {
    next.handle().subscribe({
      next: (data: any) => observer.next(data),
      error: (error: any) => observer.error(error),
      complete: () => observer.complete(),
    });
  }
}
