// src/app/core/services/auth/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { ConfigService } from '../config/config.services';

export interface LoginRequest {
  nombreusuario: string;
  contrasena: string;
}

export interface LoginResponse {
  success: boolean;
  mensaje: string;
  idusuario?: number;
  nombres?: string;
  apellidos?: string;
  rol?: string;
  empresa?: string;
  idTipoRol?: number;
}

/** Lo que devuelve tu endpoint /api/autenticarToken */
interface TokenInfoBack {
  jwtToken: string;   // <- viene así desde el backend
}

/** Formato interno para guardar y refrescar */
export interface AuthResponse {
  accessToken: string;
  expiresIn: number;   // en segundos
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private api!: string;

  private _isAuth$ = new BehaviorSubject<boolean>(this.hasValidAccess());
  isAuth$ = this._isAuth$.asObservable();

  private refreshing = false;
  private refreshQueue: Array<() => void> = [];

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.getApiUrl();
  }

  /** 1) Obtener token y LUEGO hacer /login (para tus datos de usuario) */
  signIn(req: LoginRequest): Observable<LoginResponse> {
    const usuario = req.nombreusuario;
    const clave   = req.contrasena;

    return this.authenticate(usuario, clave).pipe(
      switchMap(() => this.login(req))
    );
  }

  /** 2) Lógica de /login (tu API que devuelve datos del usuario) */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, request).pipe(
      tap((response) => {
        if (response.success) this.setUserSession(response);
      })
    );
  }

  /** 3) Pegarle a /api/autenticarToken y GUARDAR el JWT */
  authenticate(usuario: string, clave: string): Observable<AuthResponse> {
    return this.http.post<TokenInfoBack>(`${this.api}/autenticarToken`, { usuario, clave }).pipe(
      // Adaptamos TokenInfoBack -> AuthResponse interno
      map((r) => {
        // Tu token dura 5 min en el backend, aquí lo reflejamos:
        const auth: AuthResponse = {
          accessToken: r.jwtToken,
          expiresIn: 300,                 // 5 min
          refreshToken: 'placeholder'     // si aún no tienes refresh real
        };
        return auth;
      }),
      tap((auth) => {
        this.setTokens(auth);
        this._isAuth$.next(true);
      })
    );
  }

  /** 4) Refresh (si más adelante implementas /api/refresh) */
  refresh(): Observable<AuthResponse | null> {
    const rt = this.getRefreshToken();
    if (!rt) return of(null);

    if (this.refreshing) {
      return new Observable<AuthResponse | null>((obs) => {
        this.refreshQueue.push(() => obs.next(this.getAuthFromStorage()));
      });
    }
    this.refreshing = true;

    // Si aún NO tienes refresh en el backend, puedes simular NOOP:
    // return of(this.getAuthFromStorage()).pipe(tap(() => this.refreshing = false));
    // ——— pero lo correcto:
    return this.http.post<AuthResponse>(`${this.api}/refresh`, { refreshToken: rt }).pipe(
      tap((r) => this.setTokens(r)),
      tap(() => {
        this.refreshing = false;
        this.refreshQueue.forEach((fn) => fn());
        this.refreshQueue = [];
      }),
      catchError((_err) => {
        this.refreshing = false;
        this.clearSession();
        this._isAuth$.next(false);
        this.refreshQueue.forEach((fn) => fn());
        this.refreshQueue = [];
        return of(null);
      })
    );
  }

  // ===== Helpers de tokens =====
  private setTokens(r: AuthResponse) {
    localStorage.setItem('accessToken', r.accessToken);
    localStorage.setItem('refreshToken', r.refreshToken);
    localStorage.setItem('accessExp', (Date.now() + r.expiresIn * 1000).toString());
  }
  getAccessToken()  { return localStorage.getItem('accessToken'); }
  getRefreshToken() { return localStorage.getItem('refreshToken'); }
  getAccessExp(): number | null {
    const raw = localStorage.getItem('accessExp'); return raw ? +raw : null;
  }
  hasValidAccess(): boolean {
    const t = this.getAccessToken(), exp = this.getAccessExp();
    return !!t && !!exp && Date.now() < exp;
  }
  private getAuthFromStorage(): AuthResponse | null {
    const at = this.getAccessToken(), rt = this.getRefreshToken(), exp = this.getAccessExp();
    if (!at || !rt || !exp) return null;
    return {
      accessToken: at,
      refreshToken: rt,
      expiresIn: Math.max(1, Math.floor((exp - Date.now()) / 1000))
    };
  }

  // ===== Datos de usuario =====
  setUserSession(r: LoginResponse): void {
    if (!r?.success) return;
    localStorage.setItem('idusuario',   r.idusuario?.toString() || '');
    localStorage.setItem('nombres',     r.nombres || '');
    localStorage.setItem('apellidos',   r.apellidos || '');
    localStorage.setItem('rol',         r.rol || '');
    localStorage.setItem('empresa',     r.empresa || '');
    localStorage.setItem('idtiporol',   r.idTipoRol?.toString() || '');
  }

  getRolId(): number | null {
    const idtiporol = localStorage.getItem('idtiporol');
    return idtiporol ? +idtiporol : null;
  }
  getTipoId(): number | null {
    const idtiporol = localStorage.getItem('idtiporol');
    return idtiporol ? +idtiporol : null;
  }
  getUserId(): number | null {
    const idusuario = localStorage.getItem('idusuario');
    return idusuario ? +idusuario : null;
  }
  getUser(): { nombres: string, apellidos: string } | null {
    const nombres = localStorage.getItem('nombres'); const apellidos = localStorage.getItem('apellidos');
    return (nombres && apellidos) ? { nombres, apellidos } : null;
  }

  // ===== Logout =====
  logout(): void {
    this.clearSession();
    this._isAuth$.next(false);
  }
  private clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessExp');
    localStorage.removeItem('idusuario');
    localStorage.removeItem('nombres');
    localStorage.removeItem('apellidos');
    localStorage.removeItem('rol');
    localStorage.removeItem('empresa');
    localStorage.removeItem('idtiporol');
  }
}
