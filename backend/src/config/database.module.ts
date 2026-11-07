import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

const LOCAL_MONGODB_HOST = /^mongodb:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI')?.trim();

        if (!uri) {
          throw new Error('MONGODB_URI must be defined in the environment');
        }

        return {
          uri,
          ...(LOCAL_MONGODB_HOST.test(uri) ? { dbName: 'small_web' } : {}),
        };
      },
    }),
  ],
})
export class DatabaseModule {}
