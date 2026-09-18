import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'BSofts School API',
      version: '0.0.1',
      status: 'running',
    };
  }
}
