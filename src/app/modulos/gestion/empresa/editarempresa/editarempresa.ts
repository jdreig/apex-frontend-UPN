import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Empresa, EmpresaService } from '../../../../core/services/empresa/empresa';
import { LoadingService } from '../../../../compartido/loading/loadingservice';

@Component({
  selector: 'app-editar-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editarempresa.html',
  styleUrls: ['../../../../../styles/css/formulario.css']
})
export class EditarEmpresa implements OnInit {
  form?: Empresa;
  error?: string;

  // Validaciones
  rucInvalido = false;
  telefonoInvalido = false;

  // Modal de confirmación
  mostrarConfirmacion = false;
  CabeceraMensaje = '';
  mensajeConfirmacion = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: EmpresaService,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const st = history.state?.empresa as Empresa | undefined;

    if (st && st.idempresa === id) { 
      this.form = { ...st }; 
      return; 
    }

    this.loading.show();
    this.svc.obtenerPorId(id).subscribe({
      next: emp => this.form = emp,
      error: () => this.error = 'No se pudo cargar la empresa.',
      complete: () => this.loading.hide()
    });
  }

  // Guardar cambios
  guardar(f: NgForm) {
    if (!this.form) return;

    this.validarCampos();

    if (f.invalid || this.rucInvalido || this.telefonoInvalido) {
      this.error = 'Completa los campos obligatorios correctamente.';
      return;
    }

    this.loading.show();
    this.svc.actualizar(this.form.idempresa!, this.form).subscribe({
      next: () => {
        this.CabeceraMensaje = 'Actualización exitosa';
        this.mensajeConfirmacion = 'La empresa se actualizó correctamente.';
        this.mostrarConfirmacion = true;
      },
      error: () => {
        this.error = 'No se pudo actualizar la empresa.';
      },
      complete: () => this.loading.hide()
    });
  }

  // Validaciones
  private validarCampos() {
    if (!this.form) return;

    this.rucInvalido = !!this.form.ruc && !/^[0-9]{11}$/.test(this.form.ruc);
    this.telefonoInvalido = !!this.form.telefono && !/^[0-9]{6,15}$/.test(this.form.telefono);
  }

  // Cierra el modal de confirmación
  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.router.navigate(['/empresa']);
  }

  // Acción del modal "Aceptar"
  confirmar() {
    this.cerrarConfirmacion();
    this.router.navigate(['/empresa']);
  }

  // Volver a la lista de empresas
  irLista() {
    this.router.navigate(['/empresa']);
  }
}