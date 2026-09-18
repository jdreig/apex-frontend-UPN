import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.services';
export interface Categoria {
  idcategoria: number;
  descripcion: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: string;
  respondido: boolean;
  fechaCreacion: string;       // ISO string
  fechaActualizacion: string;  // ISO string
  usuarioNombre: string;
  usuarioApellido: string;
  empresa: string;

}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl: string;
  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.getApiUrl();
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  obtenerTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ticket`);
  }

  crearTicket(ticket: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket`, ticket);
  }
cambiarEstadoTicket(idticket: number, estado: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/ticket/estado/${idticket}`, { estado });
}
}
