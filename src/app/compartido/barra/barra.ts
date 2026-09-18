import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth/auth';

@Component({
  selector: 'app-barra',
  imports: [CommonModule],
  templateUrl: './barra.html',
  styleUrl: './barra.css'
})
export class Barra {
  menuOpen = false;
  mostrarConfirmacion = false;
  nombres: string = '';
  apellidos: string = '';

  constructor(private router: Router, private auth: Auth) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.nombres = user.nombres;
      this.apellidos = user.apellidos;
    }
  }
  abrirConfirmacion(event: Event) {
    event.preventDefault();
    this.mostrarConfirmacion = true;
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
  }

  confirmarLogout() {
    this.mostrarConfirmacion = false;
    console.log('Sesión cerrada');
   this.router.navigate(['/']); 
  }
}
