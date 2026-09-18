import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, LoginRequest, LoginResponse } from './../../../core/services/auth/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingComponent } from '../../../compartido/loading/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, LoadingComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  usuario = '';
  contrasena = '';
  error = false;
  mensajeError = '';

  isSubmitting = false;  // deshabilita botón y spinner en el botón
  isLoading = false;     // overlay cuando todo sale OK
  showPass = false;

  constructor(private router: Router, private auth: Auth) {}

  onLogin(): void {
    if (this.isSubmitting) return;
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.error = true;
      this.mensajeError = 'Ingresa usuario y contraseña.';
      return;
    }

    this.isSubmitting = true;
    this.error = false;
    this.mensajeError = '';

    const request: LoginRequest = {
      nombreusuario: this.usuario.trim(),
      contrasena: this.contrasena
    };

    // ⚠️ Importante: signIn primero obtiene el token y luego hace /login
    this.auth.signIn(request).subscribe({
      next: (res: LoginResponse) => {
        if (res?.success) {
          // Muestra overlay breve al entrar
          this.isLoading = true;

          // (opcional) guardas también el objeto por compatibilidad con tu app
          localStorage.setItem('usuario', JSON.stringify(res));

          setTimeout(() => {
            this.router.navigate(['/principal']);
            this.isSubmitting = false;
            this.isLoading = false;
          }, 800);
        } else {
          this.error = true;
          this.mensajeError = res?.mensaje || 'Credenciales inválidas.';
          this.isSubmitting = false;
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error de autenticación:', err);
        this.error = true;

        if (err.status === 401) {
          this.mensajeError = 'Usuario o contraseña incorrectos.';
        } else if (err.status === 0) {
          this.mensajeError = 'No se pudo conectar con el servidor.';
        } else {
          this.mensajeError = err.error?.mensaje || 'Ocurrió un error al autenticar.';
        }

        this.isSubmitting = false;
        this.isLoading = false;
      }
    });
  }
}
