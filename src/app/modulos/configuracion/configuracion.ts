import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario/usuario'; // ajusta la ruta si cambia
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['../../../styles/css/formulario.css'] // opcional
})
export class Configuracion implements OnInit {

  private fb = inject(FormBuilder);
  private usuarioSvc = inject(UsuarioService);
  private router = inject(Router);
  showConfirm = false;
  confirmMsg = '¿Deseas guardar los cambios en tu perfil?';
  // id del usuario autenticado (desde localStorage)
  idusuario: number | null = null;

  // Mensajes UI
  loading = false;
  guardando = false;
  errorMsg = '';
  successMsg = '';

  // Form principal (datos del usuario)
  form = this.fb.group({
    nombreusuario: ['', [Validators.required, Validators.minLength(3)]],
    nombres:       ['', [Validators.required]],
    apellidos:     ['', [Validators.required]],
    correo:        ['', [Validators.required, Validators.email]],
    documento:     ['', [Validators.required, Validators.maxLength(20)]],
    celular:       ['', [Validators.maxLength(20)]],
    // estado se envía oculto para no romper el PUT (hasta que ajustes backend)
    estado:        [1], // 1 = activo (ajusta a tu convención)
  });

  // Form de cambio de contraseña (opcional, sólo si se completa)
  passForm = this.fb.group({
    contrasena:  ['', [Validators.minLength(6)]],
    contrasena2: ['']
  });

  ngOnInit(): void {
    const raw = localStorage.getItem('idusuario');
    this.idusuario = raw ? +raw : null;
    if (!this.idusuario) {
      // Sin sesión, redirige
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil(this.idusuario);
  }

  cargarPerfil(id: number) {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    // Tu GET /usuario/{id} retorna un Map con campos join (rol, empresa...).
    // Usamos lo que necesitamos para rellenar el formulario.
    this.usuarioSvc.obtenerPorId(id).subscribe({
      next: (u) => {
        // u tiene: nombreusuario, nombres, apellidos, correo, documento, celular, rol, tiporol, empresa
        this.form.patchValue({
          nombreusuario: u.nombreusuario ?? '',
          nombres:       u.nombres ?? '',
          apellidos:     u.apellidos ?? '',
          correo:        u.correo ?? '',
          documento:     u.documento ?? '',
          celular:       u.celular ?? '',
          estado:        1, // por seguridad, hasta cambiar backend
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo cargar tu perfil.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Validación de coincidencia de password
  private passwordsCoinciden(): boolean {
    const a = this.passForm.value.contrasena || '';
    const b = this.passForm.value.contrasena2 || '';
    if (!a && !b) return true;       // vacío = no cambiar
    return a === b;
  }

  guardar() {
    if (!this.idusuario) return;

    this.errorMsg = '';
    this.successMsg = '';

    // valida formularios
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Revisa los campos del formulario.';
      return;
    }
    if (!this.passwordsCoinciden()) {
      this.passForm.get('contrasena2')?.setErrors({ mismatch: true });
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    // Construir payload
    const base = { ...this.form.value } as any;

    // Sólo enviar 'contrasena' si el usuario la escribió
    const pass = this.passForm.value.contrasena;
    if (pass && pass.trim().length >= 6) {
      base.contrasena = pass.trim();
    }


    this.guardando = true;
    this.usuarioSvc.actualizar(this.idusuario, base).subscribe({
      next: () => {
        this.successMsg = 'Datos actualizados correctamente.';
        // limpia campos de password
        this.passForm.reset({ contrasena: '', contrasena2: '' });
      },
      error: (err) => {
        console.error(err);
        // Mensaje comprensible
        if (err?.status === 400) {
          this.errorMsg = err?.error?.message || 'Datos inválidos. Verifica la información.';
        } else if (err?.status === 409) {
          this.errorMsg = err?.error?.mensaje || 'Conflicto al actualizar.';
        } else {
          this.errorMsg = 'Ocurrió un error al guardar.';
        }
      },
      complete: () => {
        this.guardando = false;
        this.router.navigate(['/principal']);
      }
    });
  }
    abrirConfirmacion() {
    this.errorMsg = '';
    this.successMsg = '';

    // Validaciones antes de mostrar el modal
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Revisa los campos del formulario.';
      return;
    }
    if (!this.passwordsCoinciden()) {
      this.passForm.get('contrasena2')?.setErrors({ mismatch: true });
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    // Mensaje contextual si también cambiará la contraseña
    const pass = this.passForm.value.contrasena?.trim();
    const cambiaPass = !!pass && pass.length >= 6;
    this.confirmMsg = cambiaPass
      ? 'Se guardarán tus datos y se actualizará tu contraseña. ¿Deseas continuar?'
      : 'Se guardarán los cambios en tus datos. ¿Deseas continuar?';

    this.showConfirm = true;
  }
  cancelarConfirmacion() {
    this.showConfirm = false;
  }
  confirmarGuardado() {
    this.showConfirm = false;
    this.guardar(); // usa tu método actual para persistir
    
  }
}
