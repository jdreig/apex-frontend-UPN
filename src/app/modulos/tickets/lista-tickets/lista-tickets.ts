import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../../core/services/ticket/ticket';
import { LoadingService } from '../../../compartido/loading/loadingservice';
import { Barra } from '../../../compartido/barra/barra';
import { Auth } from '../../../core/services/auth/auth';



export interface TicketRow {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;           // 👈 ahora string
  registradoPor: string;
  empresa: string;
  fechaCreacionISO?: string;
  fechaActualizacionISO?: string;
  fechaCreacionFmt?: string;
  fechaActualizacionFmt?: string;
  estadoDesc: string;       // texto (puede usarse igual que estado si quieres)
  showDropdown?: boolean;  
}

@Component({
  selector: 'app-lista-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, Barra],
  templateUrl: './lista-tickets.html',
  styleUrls: ['./lista-tickets.css']
})
export class ListaTickets implements OnInit {
vista: 'lista' | 'cards' = 'lista';
listaEstados = [
  { id: 1, descripcion: 'Abierto' },
  { id: 2, descripcion: 'En proceso' },
  { id: 3, descripcion: 'Atendido' },
  { id: 4, descripcion: 'Cerrado' },
  { id: 5, descripcion: 'Reabierto' }
];
  tickets: TicketRow[] = [];
  filtroEstado = '';
  filtroPrioridad = '';
  filtroCategoria = '';
  filtroTexto = '';
  pagina = 1;
  itemsPorPagina = 10;

  constructor(
    private ticketService: TicketService,
    private loading: LoadingService,
    private router: Router,
    private auth: Auth // <-- agregar

  ) { }

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.loading.show();
    this.ticketService.obtenerTickets().subscribe({
      next: (rows: any[]) => {
        this.tickets = (rows || []).map(r => ({
          id: r.idticket,
          titulo: r.titulo,
          descripcion: r.descripcion,
          categoria: r.categoria,
          prioridad: r.prioridadDesc,
          estado: r.estadoDesc,
          estadoDesc: r.estadoDesc,
          registradoPor: `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim(),
          empresa: r.empresa ?? '',
          fechaCreacionISO: r.fechacreacionRaw,
          fechaActualizacionISO: r.fechacierreRaw,
          fechaCreacionFmt: r.fechacreacion,
          fechaActualizacionFmt: r.fechacierre,
          showDropdown: false

        }));
        this.pagina = 1;
        this.loading.hide();
      },
      error: (err: any) => {
        console.error('Error cargando tickets:', err);
        this.loading.hide();
      }
    });
  }
  asDate(val?: string): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  verDetalle(ticket: TicketRow): void {
    console.log('Ver detalle del ticket:', ticket);
    
    this.router.navigate(['/ticketagente', ticket.id]);

  }

  private norm(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
    ordenColumna: keyof TicketRow | null = null;
    ordenAscendente = true;

  ordenar(col: keyof TicketRow) {
  if (this.ordenColumna === col) {
    this.ordenAscendente = !this.ordenAscendente;
  } else {
    this.ordenColumna = col;
    this.ordenAscendente = true;
  }

  this.tickets.sort((a, b) => {
    const valA = (a[col] ?? '').toString().toLowerCase();
    const valB = (b[col] ?? '').toString().toLowerCase();

    if (valA < valB) return this.ordenAscendente ? -1 : 1;
    if (valA > valB) return this.ordenAscendente ? 1 : -1;
    return 0;
  });
}
  get ticketsFiltrados(): TicketRow[] {
    const te = this.norm(this.filtroTexto);
    const est = this.norm(this.filtroEstado);
    const pri = this.norm(this.filtroPrioridad);
    const cat = this.norm(this.filtroCategoria);

    return this.tickets.filter(t => {
      const okText = !te || this.norm(t.titulo).includes(te) || this.norm(t.registradoPor).includes(te) || this.norm(t.empresa).includes(te);
      const okEstado = !est || this.norm(t.estado) === est;
      const okPrio = !pri || this.norm(t.prioridad) === pri;
      const okCat = !cat || this.norm(t.categoria) === cat;
      return okText && okEstado && okPrio && okCat;
    });
  }

  get ticketsPaginados(): TicketRow[] {
    const inicio = (this.pagina - 1) * this.itemsPorPagina;
    return this.ticketsFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  paginaAnterior(): void { if (this.pagina > 1) this.pagina--; }
  paginaSiguiente(): void { if (this.pagina < this.totalPaginas) this.pagina++; }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.ticketsFiltrados.length / this.itemsPorPagina)); }

  limpiarFiltros(): void {
    this.filtroEstado = this.filtroPrioridad = this.filtroCategoria = this.filtroTexto = '';
    this.pagina = 1;
  }
  hayFiltrosActivos(): boolean {
    return !!(this.filtroEstado || this.filtroPrioridad || this.filtroCategoria || this.filtroTexto);
  }
  estadoClase(e: string): string {
    const v = (e || '').toLowerCase().replace(/\s+/g, '-'); // Normaliza
    if (v.includes('atendido')) return 'atendido';
    if (v.includes('en-proceso')) return 'en-proceso';
    if (v.includes('cerrado')) return 'cerrado';
    if (v.includes('abierto')) return 'abierto';
    if (v.includes('reabierto')) return 'reabierto';
    return 'pendiente';
  }
  prioridadClase(p: string): string {
    const v = (p || '').toLowerCase();
    if (v.includes('Crítica') || v.includes('critica') ||
     v.includes('crítico') || v.includes('Critico')) return 'critico';
    if (v.includes('alta')) return 'alta';
    if (v.includes('media')) return 'media';
    return 'baja';
  }
  get categoriasUnicas(): string[] {
    return [...new Set(this.tickets.map(t => t.categoria).filter(Boolean))].sort();
  }
  trackById(_index: number, ticket: TicketRow): number {
  return ticket.id;
}
// Para abrir/cerrar dropdown
toggleDropdown(ticket: TicketRow) {
  ticket.showDropdown = !ticket.showDropdown;
}
cambiarEstado(ticket: TicketRow, nuevoEstado: { id: number, descripcion: string }) {
  ticket.estado = nuevoEstado.id.toString();     // <- guardas string para UI
  ticket.estadoDesc = nuevoEstado.descripcion;
  ticket.showDropdown = false;

  this.ticketService.cambiarEstadoTicket(ticket.id, nuevoEstado.id)
    .subscribe({
      next: () => console.log('Estado actualizado'),
      error: (err: any) => console.error('Error actualizando estado', err)
    });
}
}
