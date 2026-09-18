import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { TicketAgenteService  } from '../../../core/services/ticketagenteservice/ticketagenteservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth/auth';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-ticketagente',
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './ticketagente.html',
  styleUrl: './ticketagente.css'
})
export class ticketagente implements OnInit {

  idticket: number = 0;  // ID del ticket
  respuestas: any[] = [];  // Respuestas del ticket
  nuevaRespuesta: string = '';  // Respuesta que el agente escriba
  idusuario: number = 1;  
  filtroUsuario: string = '';
  filtroFecha: string = '';
  loggedInUserName: string = ''; // Aquí almacenarás el nombre del usuario autenticado
  filtroContenido: string = ''; // NUEVO: filtro por texto de la respuesta

  constructor(
    private ticketAgenteService: TicketAgenteService,
    private route: ActivatedRoute,     private auth: Auth
// Inyectamos el servicio de autenticación
) { }

  ngOnInit(): void {
    this.idticket = Number(this.route.snapshot.paramMap.get('idticket'));
    this.cargarRespuestas();
       this.idusuario = this.auth.getUserId() || 0; // Obtén el idusuario desde el AuthService
    if (!this.idusuario) {
      console.error('Usuario no autenticado');
    }
    const user = this.auth.getUser(); // Método para obtener el usuario del servicio de autenticación
    if (user) {
      this.loggedInUserName = user.nombres; // Asumiendo que `nombres` es parte de la respuesta
    }
  }

  // Método para cargar las respuestas del ticket
 cargarRespuestas(): void {
  this.ticketAgenteService.getRespuestasTicket(this.idticket).subscribe(res => {
    this.respuestas = (res)
    console.log(this.respuestas);
  });
}

  // Método para registrar una nueva respuesta
  registrarRespuesta(): void {
    if (this.nuevaRespuesta.trim()) {
      this.ticketAgenteService.registrarRespuesta(this.idticket, this.nuevaRespuesta, this.idusuario).subscribe(res => {
        this.nuevaRespuesta = '';
        this.cargarRespuestas();
      });
    }
  }
   // === Filtrado de respuestas inline ===
 get respuestasFiltradas(): any[] {
    let result = this.respuestas;

    // Filtrar por usuario
    if (this.filtroUsuario?.trim()) {
      const filtro = this.filtroUsuario.toLowerCase();
      result = result.filter(r =>
        (r.usuario_nombres + ' ' + r.usuario_apellidos).toLowerCase().includes(filtro)
      );
    }

    // Filtrar por fecha (YYYY-MM-DD)
    if (this.filtroFecha?.trim()) {
      result = result.filter(r => {
        const fechaResp = new Date(r.fechaRespuesta).toISOString().substring(0,10);
        return fechaResp === this.filtroFecha;
      });
    }

    // Filtrar por contenido del mensaje
    if (this.filtroContenido?.trim()) {
      const filtro = this.filtroContenido.toLowerCase();
      result = result.filter(r => r.respuesta.toLowerCase().includes(filtro));
    }

    return result;
  }

}