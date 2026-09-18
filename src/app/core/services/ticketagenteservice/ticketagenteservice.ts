import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.services';

@Injectable({
  providedIn: 'root'
})
export class TicketAgenteService {

  private apiUrl: string;
  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.getApiUrl();
  }

  // Obtener las respuestas del ticket por idticket
  getRespuestasTicket(idticket: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ticketagente/${idticket}`);
  }

  // Registrar una nueva respuesta
  registrarRespuesta(idticket: number, respuesta: string, idusuario: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ticketagente`, {
      ticket: idticket,
      usuario: idusuario,
      respuesta: respuesta
    });
  }

  
}
