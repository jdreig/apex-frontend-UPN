import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { Barra } from "../../../compartido/barra/barra";
import { Auth } from '../../../core/services/auth/auth';

interface ActionItem {
  name: string;
  link: string;
  icon: string;
}
@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Barra],
  templateUrl: './principal.html',
  styleUrls: ['./principal.css'] // <-- plural
})

export class Principal implements OnInit {
  actions: ActionItem[] = [];

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    this.refreshActions();
  }

  private refreshActions(): void {
    const tipo = this.auth.getTipoId(); // 1 = admin Apex
    if (tipo === 1) {
      // Admin Apex: configuración, lista tickets, empresa, usuario
      this.actions = [
        { name: 'Acualice sus datos',  link: '/configuracion/:id', icon: 'assets/img/principal/configuracion.png' },
        { name: 'Ver los tickets', link: '/listatickets',   icon: 'assets/img/principal/lista.png' },
        { name: 'Empresas',       link: '/empresa',        icon: 'assets/img/principal/edificio.png' },
        { name: 'Usuario',        link: '/usuario',        icon: 'assets/img/principal/usuario.png' },
      ];
    } else {
      // No admin: crear ticket y ver lista de tickets
      this.actions = [
        { name: 'Nuevo Ticket',   link: '/crear',        icon: 'assets/img/principal/agregar.png' },
        { name: 'Ver los tickets', link: '/listatickets', icon: 'assets/img/principal/lista.png' },
        { name: 'Acualice sus datos',  link: '/configuracion/:id', icon: 'assets/img/principal/configuracion.png' },
      ];
    }
  }
}