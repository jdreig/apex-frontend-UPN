// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modulos/gestion/login/login').then(m => m.Login) },

  { path: 'principal', canActivate: [authGuard],
    loadComponent: () => import('./modulos/gestion/principal/principal').then(m => m.Principal) },

  // Tickets (cualquier logueado)
  { path: 'crear', canActivate: [authGuard],
    loadComponent: () => import('./modulos/tickets/crear/crear').then(m => m.Crear) },
  { path: 'listatickets', canActivate: [authGuard],
    loadComponent: () => import('./modulos/tickets/lista-tickets/lista-tickets').then(m => m.ListaTickets) },
  { path: 'ticketagente/:idticket', canActivate: [authGuard],
    loadComponent: () => import('./modulos/tickets/ticketagente/ticketagente').then(m => m.ticketagente) },
  { path: 'configuracion/:id', canActivate: [authGuard],
    loadComponent: () => import('./modulos/configuracion/configuracion').then(m => m.Configuracion) },

  // SOLO ADMIN (idtiporol = 1)
  { path: 'empresa', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/empresa/listaempresa/listaempresa').then(m => m.ListarEmpresa) },
  { path: 'empresa/crear', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/empresa/crearempresa/crearempresa').then(m => m.CrearEmpresa) },
  { path: 'empresa/editar/:id', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/empresa/editarempresa/editarempresa').then(m => m.EditarEmpresa) },

  { path: 'usuario', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/usuario/listausuario/listausuario').then(m => m.ListaUsuario) },
  { path: 'usuario/crear', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/usuario/mantusuario/mantusuario').then(m => m.MantUsuario) },
  { path: 'usuario/editar/:id', canActivate: [authGuard], data: { roles: [1] },
    loadComponent: () => import('./modulos/gestion/usuario/mantusuario/mantusuario').then(m => m.MantUsuario) },


  // Redirecciones
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
