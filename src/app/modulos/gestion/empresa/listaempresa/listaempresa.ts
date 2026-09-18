import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService, Empresa } from '../../../../core/services/empresa/empresa';
import { Barra } from '../../../../compartido/barra/barra';

@Component({
  selector: 'app-lista-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, Barra],
  templateUrl: './listaempresa.html',
styleUrls: ['../../../../../styles/css/tablas.css']
})
export class ListarEmpresa implements OnInit {
  empresas: Empresa[] = [];

  // filtros
  filtro = '';

  // paginación
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  constructor(private svc: EmpresaService, private router: Router) {}

  ngOnInit(): void {
    this.svc.listar().subscribe({
      next: (rows) => this.empresas = rows ?? [],
      error: (e) => console.error(e)
    });
  }

  // --- navegación acciones ---
  irCrear()  { this.router.navigate(['/empresa/crear']); }
  irEditar(e: Empresa)   { this.router.navigate(['/empresa/editar', e.idempresa]); }
  irEliminar(e: Empresa) { this.router.navigate(['/empresa/eliminar', e.idempresa]); }

  limpiar() { this.filtro = ''; this.page = 1; }

  // --- derivadas (filtro + paginado) ---
  get filtradas(): Empresa[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.empresas;
    return this.empresas.filter(e =>
      (e.ruc ?? '').toLowerCase().includes(q) ||
      (e.razonsocial ?? '').toLowerCase().includes(q) ||
      (e.direccion ?? '').toLowerCase().includes(q) ||
      (e.correo ?? '').toLowerCase().includes(q) ||
      (e.telefono ?? '').toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtradas.length / this.pageSize));
  }

  get paginadas(): Empresa[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtradas.slice(start, start + this.pageSize);
  }

  setPageSize(n: number) { this.pageSize = +n; this.page = 1; }
  prev() { if (this.page > 1) this.page--; }
  next() { if (this.page < this.totalPages) this.page++; }
}
