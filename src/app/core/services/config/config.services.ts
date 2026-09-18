import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
    private readonly apiUrl = 'https://apex-backend-api-z0oy.onrender.com/api';
  //private readonly apiUrl = 'http://localhost:8088/api';

  getApiUrl(): string {
    return this.apiUrl;
  }
}