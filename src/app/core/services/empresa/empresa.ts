import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.services'; // importa ConfigService

export interface Empresa {
  idempresa?: number;
  ruc: string;
  razonsocial: string;
  direccion: string;
  correo: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    // Inicializa la URL
    this.apiUrl = this.configService.getApiUrl();
  }
  listar(): Observable<Empresa[]> {    
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresa`);
  }
    obtenerPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/empresa/${id}`);
  }

  crear(body: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/empresa`, body);
  }

  actualizar(id: number, body: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/empresa/${id}`, body);
  }
}
