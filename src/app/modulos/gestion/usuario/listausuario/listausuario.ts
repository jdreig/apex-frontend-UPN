import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Barra } from '../../../../compartido/barra/barra';
import { UsuarioService, UsuarioRow } from '../../../../core/services/usuario/usuario';

@Component({
  selector: 'app-lista-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, Barra],
  templateUrl: './listausuario.html',
  styleUrls: ['../../../../../styles/css/tablas.css']
})
export class ListaUsuario implements OnInit {
  usuarios: UsuarioRow[] = [];

  // filtros
  filtro = '';

  // paginación
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  // Modal de confirmación
  mostrarConfirmacion = false;
  cabeceraMensaje = '';
  mensajeConfirmacion = '';
  accionConfirmada: (() => void) | null = null;

  constructor(private svc: UsuarioService, private router: Router) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.svc.listar().subscribe({
      next: rows => (this.usuarios = rows ?? []),
      error: err => console.error(err)
    });
  }

  // navegación
  irCrear() {
    this.router.navigate(['/usuario/crear']);
  }
  irEditar(u: UsuarioRow) {
    this.router.navigate(['/usuario/editar', u.idusuario], { state: { usuario: u } });
  }

  // Modal de confirmación antes de eliminar
  confirmarEliminar(u: UsuarioRow) {
    this.cabeceraMensaje = 'Eliminar Usuario';
    this.mensajeConfirmacion = `¿Seguro que deseas eliminar al usuario "${u.nombres} ${u.apellidos}"?`;
    this.mostrarConfirmacion = true;
    this.accionConfirmada = () => this.eliminar(u);
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.accionConfirmada = null;
  }

  ejecutarConfirmacion() {
    if (this.accionConfirmada) this.accionConfirmada();
    this.cerrarConfirmacion();
  }

eliminar(u: UsuarioRow) {
  this.svc.eliminar(u.idusuario).subscribe({
    next: (res) => {
      if (res?.ok) {
        this.usuarios = this.usuarios.filter(x => x.idusuario !== u.idusuario);
        if (this.paginados.length === 0 && this.page > 1) this.page--;
      }
    },
    error: (err) => {
      if (err.status === 403) {
        this.cabeceraMensaje = 'Operación no permitida';
        this.mensajeConfirmacion = err?.error?.mensaje || 'No se puede eliminar al administrador principal.';
        this.mostrarConfirmacion = true;
      } else if (err.status === 409) {
        if (err.error.empresas=== null){    
        this.cabeceraMensaje = 'No se puede eliminar';
        this.mensajeConfirmacion = `El usuario técnico está vinculado en varios tickets`;
        this.mostrarConfirmacion = true;
        } else {
        const empresas = Array.isArray(err.error.empresas) ? err.error.empresas.join(', ') : '';
        this.cabeceraMensaje = 'No se puede eliminar';
        this.mensajeConfirmacion = `El usuario está vinculado a ${err.error.tickets} ticket(s). Empresa: ${empresas}.`;
        this.mostrarConfirmacion = true;
        }
      } else {
        console.error(err);
      }
    }
  });
}

  limpiar() {
    this.filtro = '';
    this.page = 1;
  }

  // Derivadas
get filtrados(): UsuarioRow[] {
  const q = this.filtro.trim().toLowerCase();
  let result = this.usuarios;
  if (q) {
    result = this.usuarios.filter(u =>
      (u.nombreusuario ?? '').toLowerCase().includes(q) ||
      (u.nombres ?? '').toLowerCase().includes(q) ||
      (u.apellidos ?? '').toLowerCase().includes(q) ||
      (u.correo ?? '').toLowerCase().includes(q) ||
      (u.documento ?? '').toLowerCase().includes(q) ||
      (u.celular ?? '').toLowerCase().includes(q) ||
      (u.rol ?? '').toLowerCase().includes(q) ||
      (u.tiporol ?? '').toLowerCase().includes(q) ||
      (u.empresa ?? '').toLowerCase().includes(q)
    );
  }
  console.log('Filtro:', q, 'Result:', result);
  return result;
}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.pageSize));
  }

  get paginados(): UsuarioRow[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtrados.slice(start, start + this.pageSize);
  }

  setPageSize(n: number) {
    this.pageSize = +n;
    this.page = 1;
  }
  prev() { if (this.page > 1) this.page--; }
  next() { if (this.page < this.totalPages) this.page++; }

  asDate(val?: string): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
}
