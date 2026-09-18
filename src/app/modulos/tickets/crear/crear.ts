import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, Categoria } from '../../../core/services/ticket/ticket';
import { LoadingService } from '../../../compartido/loading/loadingservice';
import { Auth } from '../../../core/services/auth/auth';

export interface Prioridad {
  codigo: number;
  descripcion: string;
}

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear.html',
  styleUrls: ['../../../../styles/css/formulario.css']
})
export class Crear implements OnInit {

  ticket = {
    titulo: '',
    descripcion: '',
    prioridad: 2,        // "Media"
    categoria: '',
    loggedInUserName: '' // nombre del usuario autenticado
  };

  categorias: Categoria[] = [];
  prioridades: Prioridad[] = [
    { codigo: 1, descripcion: 'Baja' },
    { codigo: 2, descripcion: 'Media' },
    { codigo: 3, descripcion: 'Alta' },
    { codigo: 4, descripcion: 'Crítica' }
  ];

  mostrarConfirmacion = false;
  mensajeConfirmacion = '';
  CabeceraMensaje = 'Alerta';

  idusuario: number = 0; // ID del usuario logueado

  constructor(
    private ticketService: TicketService,
    private loading: LoadingService,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    // Obtener el id del usuario logueado
    this.idusuario = this.auth.getUserId() || 0;

    // Obtener nombre del usuario logueado
    const user = this.auth.getUser();
    if (user) {
      this.ticket.loggedInUserName = user.nombres;
    }

    if (!this.idusuario) {
      console.error('Usuario no autenticado');
      this.CabeceraMensaje = '⚠️ Alerta';
      this.mensajeConfirmacion = 'No se encontró usuario logueado.';
      this.mostrarConfirmacion = true;
    }

    // Cargar categorías
    this.ticketService.obtenerCategorias().subscribe({
      next: (cats) => this.categorias = cats,
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  enviarFormulario(): void {
    // Validación básica
    if (!this.ticket.titulo || !this.ticket.categoria || !this.ticket.descripcion) {
      this.CabeceraMensaje = '⚠️ Alerta';
      this.mensajeConfirmacion = 'Debes completar todos los campos obligatorios';
      this.mostrarConfirmacion = true;
      return;
    }

    if (!this.idusuario) {
      this.CabeceraMensaje = '⚠️ Alerta';
      this.mensajeConfirmacion = 'No se encontró usuario logueado.';
      this.mostrarConfirmacion = true;
      return;
    }

    // Preparar payload enviando idusuario como idcliente
    const ticketEnviar = {
      titulo: this.ticket.titulo.trim(),
      descripcion: this.ticket.descripcion.trim(),
      prioridad: Number(this.ticket.prioridad),
      categoria: { idcategoria: Number(this.ticket.categoria) },
      cliente: { usuario: { idusuario: this.idusuario } }, // <--- así se anida
      estado: 1
    };

    this.loading.show();
    this.ticketService.crearTicket(ticketEnviar).subscribe({
      next: () => {
        this.CabeceraMensaje = 'Registro Exitoso';
        this.mensajeConfirmacion = 'Ticket creado correctamente';
        this.mostrarConfirmacion = true;
        // Reset del formulario manteniendo el nombre del usuario
        this.ticket = { titulo: '', descripcion: '', prioridad: 2, categoria: '', loggedInUserName: this.ticket.loggedInUserName };
        setTimeout(() => this.loading.hide(), 300);
      },
      error: (err) => {
        console.error(err);
        this.CabeceraMensaje = '⚠️ Error';
        this.mensajeConfirmacion = 'Error al crear ticket';
        this.mostrarConfirmacion = true;
        setTimeout(() => this.loading.hide(), 300);
      }
    });
  }

  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
  }
}
