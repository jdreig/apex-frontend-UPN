import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.services';

export interface Rol {
  idrol: number;
  descripcion: string;
  tiporol: number;
  estado: number;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  private baseUrl: string;

  constructor(private http: HttpClient, config: ConfigService) {
    this.baseUrl = config.getApiUrl();
  }

  listar(): Observable<Rol[]> {
    // Asegúrate de tener un GET /api/rol en el backend
    return this.http.get<Rol[]>(`${this.baseUrl}/rol`);
  }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/rol/${id}`);
  }
}
