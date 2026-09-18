import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.services'; // importa ConfigService

export interface UsuarioRow {
  idusuario: number;
  nombreusuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  documento: string;
  celular: string;
  rol: string;
  tiporol: string;
  empresa: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl: string;

  constructor(private http: HttpClient, config: ConfigService) {
    this.baseUrl = config.getApiUrl(); 
  }

  // Lista completa (si quieres server-side filter, pásalo como ?q=)
  listar(q?: string): Observable<UsuarioRow[]> {
    let params = new HttpParams();
    if (q && q.trim()) params = params.set('q', q.trim());
    return this.http.get<UsuarioRow[]>(`${this.baseUrl}/usuario`, { params });
  }

  obtenerPorId(id: number): Observable<UsuarioRow> {
    return this.http.get<UsuarioRow>(`${this.baseUrl}/usuario/${id}`);
  }

  crear(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuario`, body);
  }

  actualizar(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuario/${id}`, body);
  }

 eliminar(id: number): Observable<any> {
  return this.http.delete<any>(`${this.baseUrl}/usuario/${id}`);
}
    obtenerEntidad(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuario/${id}`);
  }
}
