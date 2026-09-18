import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa, EmpresaService } from '../../../../core/services/empresa/empresa';
import { LoadingService } from '../../../../compartido/loading/loadingservice';

@Component({
  selector: 'app-crear-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crearempresa.html',
  styleUrls: ['../../../../../styles/css/formulario.css']
})
export class CrearEmpresa {
  form: Empresa = { ruc: '', razonsocial: '', direccion: '', correo: '', telefono: '' };
  error?: string;
  mostrarConfirmacion = false;
  CabeceraMensaje = '';
  mensajeConfirmacion = '';

  constructor(private svc: EmpresaService, private loading: LoadingService, private router: Router) { }

  guardar(f: NgForm) {
    if (f.invalid) {
      this.error = 'Completa los campos obligatorios.';
      return;
    }

    this.loading.show();
    this.svc.crear(this.form).subscribe({
      next: () => {
        this.CabeceraMensaje = 'Éxito';
        this.mensajeConfirmacion = 'La empresa se creó correctamente.';
        this.mostrarConfirmacion = true;
      },
      error: () => {
        this.CabeceraMensaje = 'Error';
        this.mensajeConfirmacion = 'No se pudo crear la empresa.';
        this.mostrarConfirmacion = true;
      },
      complete: () => this.loading.hide()
    });
  }
  get rucInvalido(): boolean {
    return !!this.form.ruc && !/^[0-9]{11}$/.test(this.form.ruc);
  }

  get telefonoInvalido(): boolean {
    return !!this.form.telefono && !/^[0-9]{6,15}$/.test(this.form.telefono);
  }
  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.router.navigate(['/empresa']);
  }

  irLista() {
    this.router.navigate(['/empresa']);
  }


}

