import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadImage(file: Express.Multer.File, folder = 'powergym/users') {
    return new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
              //  Si falla
              if (error || !result) {
                console.log('CLOUDINARY ERROR =>', error);
                console.log('CLOUDINARY RESULT =>', result);
                return reject(
                  error instanceof Error
                    ? error
                    : new Error('Cloudinary upload failed'),
                );
              }

              //  Si sale bien
              return resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
            },
          )
          .end(file.buffer);
      },
    );
  }

  async deleteImage(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      /* empty */
    }
  }
}
