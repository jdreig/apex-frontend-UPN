import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UsuarioService } from '../../../../core/services/usuario/usuario';
import { EmpresaService, Empresa } from '../../../../core/services/empresa/empresa';
import { RolService, Rol } from '../../../../core/services/rol/rol';
import { LoadingService } from '../../../../compartido/loading/loadingservice';

interface UsuarioForm {
  idusuario?: number;
  nombreusuario: string;
  contrasena?: string; // opcional en edición
  nombres: string;
  apellidos: string;
  documento: string;
  celular: string;
  correo: string;
  estado: number;
  rol: { idrol: number | null; tiporol: number | null };
  empresa: { idempresa: number | null };
}

@Component({
  selector: 'app-mant-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantusuario.html',
  styleUrls: ['../../../../../styles/css/formulario.css']
})
export class MantUsuario implements OnInit {

  isEdit = false;
  error?: string;

  // Modelo
  form: UsuarioForm = {
    nombreusuario: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    documento: '',
    celular: '',
    correo: '',
    estado: 1,
    rol: { idrol: null, tiporol: null },
    empresa: { idempresa: null }
  };

  // Catálogos + filtros
  roles: Rol[] = [];
  empresas: Empresa[] = [];
  rolFilter = '';
  empresaFilter = '';
  // Variables para dropdown
  rolInput: string = '';
  empresaInput: string = '';
  showRolDropdown = false;
  showEmpresaDropdown = false;
  filteredRoles: Rol[] = [];
  filteredEmpresas: Empresa[] = [];
  mostrarConfirmacion = false;
  CabeceraMensaje = '';
  mensajeConfirmacion = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioSvc: UsuarioService,
    private empresaSvc: EmpresaService,
    private rolSvc: RolService,
    private loading: LoadingService
  ) { }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.loading.show();

    try {
      // Cargar catálogos en paralelo
      const [roles, empresas] = await firstValueFrom(
        forkJoin([this.rolSvc.listar(), this.empresaSvc.listar()])
      );
      this.roles = roles ?? [];
      this.empresas = empresas ?? [];

      // Si es edición, trae el usuario por id
      if (this.isEdit) {
        const id = Number(idParam);
        const u: any = await firstValueFrom(this.usuarioSvc.obtenerPorId(id));
        this.form = {
          idusuario: u.idusuario,
          nombreusuario: u.nombreusuario ?? '',
          contrasena: '', // vacío => no cambiar
          nombres: u.nombres ?? '',
          apellidos: u.apellidos ?? '',
          documento: u.documento ?? '',
          celular: u.celular ?? '',
          correo: u.correo ?? '',
          estado: (u.estado ?? 1),
          rol: { idrol: u?.rol?.idrol ?? null, tiporol: u?.rol?.tiporol ?? null },
          empresa: { idempresa: u?.empresa?.idempresa ?? null }
        };
      }
    } catch (e) {
      console.error(e);
      this.error = this.isEdit ? 'No se pudo cargar el usuario.' : 'No se pudieron cargar los catálogos.';
    } finally {
      this.loading.hide();
    }
  }

  // Validación del celular
  celularValid(): boolean {
    const celularRegex = /^[0-9]*$/;
    return celularRegex.test(this.form.celular);
  }

  // Filtrados de selects
  get rolesFiltrados(): Rol[] {
    const q = this.rolFilter.trim().toLowerCase();
    return q ? this.roles.filter(r => (r.descripcion ?? '').toLowerCase().includes(q)) : this.roles;
  }
  get empresasFiltradas(): Empresa[] {
    const q = this.empresaFilter.trim().toLowerCase();
    return q
      ? this.empresas.filter(e =>
        (e.razonsocial ?? '').toLowerCase().includes(q) ||
        (e.ruc ?? '').toLowerCase().includes(q)
      )
      : this.empresas;
  }

  guardar(f: NgForm) {
    f.control.markAllAsTouched(); // muestra los errores
    this.error = undefined;

    // Validación de campos obligatorios
    if (
      f.invalid ||
      !this.form.rol.idrol ||
      (this.form.rol.tiporol !== 1 && !this.form.empresa.idempresa)
    ) {
      this.error = 'Completa los campos requeridos y selecciona Rol y Empresa.';
      return;
    }

    // Validación del celular
if (!this.celularValid() || this.form.celular.length !== 9) {
  this.error = 'El campo celular debe tener exactamente 9 números.';
  return;
}
    const payload: any = {
      nombreusuario: this.form.nombreusuario,
      contrasena: this.form.contrasena || undefined, // opcional en edición
      nombres: this.form.nombres,
      apellidos: this.form.apellidos,
      documento: this.form.documento,
      celular: this.form.celular,
      correo: this.form.correo,
      estado: this.form.estado,
      idrol: this.form.rol.idrol,
      // Solo enviar idempresa si el rol requiere empresa
      ...(this.form.rol.tiporol !== 1 && this.form.empresa.idempresa != null
        ? { idempresa: this.form.empresa.idempresa }
        : {})
    };

    this.loading.show();

    const req$ = this.isEdit
      ? this.usuarioSvc.actualizar(this.form.idusuario!, payload)
      : this.usuarioSvc.crear(payload);

    req$.subscribe({
      next: () => {
        this.CabeceraMensaje = this.isEdit ? 'Usuario Actualizado' : 'Usuario Creado';
        this.mensajeConfirmacion = this.isEdit
          ? 'El usuario se actualizó correctamente.'
          : 'El usuario se creó correctamente.';
        this.mostrarConfirmacion = true;
      },
      error: (err) => {
        console.error(err);
        this.error = this.isEdit
          ? 'No se pudo actualizar el usuario.'
          : 'No se pudo crear el usuario.';
      },
      complete: () => this.loading.hide()
    });
  }

  // Abrir dropdown y mostrar toda la lista
  openRolDropdown() {
    this.showRolDropdown = true;
    this.filteredRoles = [...this.roles]; // mostrar todos inicialmente
  }

  openEmpresaDropdown() {
    this.showEmpresaDropdown = true;
    this.filteredEmpresas = [...this.empresas]; // mostrar todos inicialmente
  }

  // Filtrar mientras escribe
  filterRoles() {
    const q = this.rolInput.toLowerCase();
    this.filteredRoles = this.roles.filter(r =>
      r.descripcion?.toLowerCase().includes(q)
    );
  }

  filterEmpresas() {
    const q = this.empresaInput.toLowerCase();
    this.filteredEmpresas = this.empresas.filter(e =>
      (e.razonsocial?.toLowerCase().includes(q) || e.ruc?.toLowerCase().includes(q))
    );
  }

  // Selección de item
  selectRol(r: Rol) {
    this.form.rol.idrol = r.idrol ?? null;
    this.form.rol.tiporol = r.tiporol ?? null;
    this.rolInput = r.descripcion ?? '';
    this.showRolDropdown = false;

    // Reset empresa al cambiar rol
    this.form.empresa.idempresa = null;
    this.empresaInput = '';
  }

  selectEmpresa(e: Empresa) {
    this.form.empresa.idempresa = e.idempresa ?? null;
    this.empresaInput = `${e.razonsocial} (${e.ruc})`;
    this.showEmpresaDropdown = false;
  }

  // Navegación
  irLista() { this.router.navigate(['/usuario']); }

  // Modal
  cerrarConfirmacion() { this.mostrarConfirmacion = false;
    this.router.navigate(['/usuario']);
   }
}