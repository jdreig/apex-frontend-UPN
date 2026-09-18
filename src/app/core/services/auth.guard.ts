// core/services/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, CanMatchFn, Route, UrlSegment, UrlTree } from '@angular/router';
import { Auth } from './auth/auth';
import { Observable } from 'rxjs';

function isLogged(): boolean {
  const id = localStorage.getItem('idusuario');   // <-- CLAVE REAL que guardas al loguear
  // valida que sea número > 0
  return !!id && !isNaN(+id) && +id > 0;
}

function hasAllowedRole(roles?: number[]): boolean {
  if (!roles || roles.length === 0) return true;
  const tiporol = localStorage.getItem('idtiporol');
  const n = tiporol ? +tiporol : NaN;
  return !isNaN(n) && roles.includes(n);
}

function check(routeRoles?: number[]): boolean | UrlTree | Observable<boolean | UrlTree> {
  const router = inject(Router);
  const auth   = inject(Auth);

  // 1) ¿hay sesión?
  if (!isLogged()) return router.createUrlTree(['/login']);

  // 2) ¿access token válido?
  if (auth.hasValidAccess()) {
    // 3) roles
    return hasAllowedRole(routeRoles) ? true : router.createUrlTree(['/listatickets']);
  }

  // 2b) Intento de refresh silencioso si hay refresh token
  return new Observable<boolean | UrlTree>(observer => {
    auth.refresh().subscribe({
      next: (ar) => {
        if (ar?.accessToken) {
          observer.next(hasAllowedRole(routeRoles) ? true : router.createUrlTree(['/listatickets']));
        } else {
          observer.next(router.createUrlTree(['/login']));
        }
        observer.complete();
      },
      error: () => {
        observer.next(router.createUrlTree(['/login']));
        observer.complete();
      }
    });
  });
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const roles = route.data?.['roles'] as number[] | undefined;
  return check(roles);
};

export const authMatchGuard: CanMatchFn = (route: Route, _s: UrlSegment[]) => {
  const roles = route.data?.['roles'] as number[] | undefined;
  return check(roles);
};
