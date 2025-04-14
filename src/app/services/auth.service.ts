import { Injectable } from '@angular/core';

export type Role = 'Agente' | 'Analista' | 'Empleado' | 'Mantenimiento';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: { username: string; role: Role } | null = null;

  login(username: string, password: string, role: string): boolean {
    if (username === 'admin' && password === 'admin') {
      if (role === 'Agente' || role === 'Analista' || role === 'Empleado') {
        this.currentUser = { username, role: role as Role };
        return true;
      }
    }
    if (username === 'mantenimiento' && password === 'admin' && role === 'Mantenimiento') {
      this.currentUser = { username, role: 'Mantenimiento' };
      return true;
    }
    return false; 
  }    
  logout(): void {
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getRole(): Role | null {
    return this.currentUser?.role ?? null;
  }

  getUser(): { username: string; role: Role } | null {
    return this.currentUser;
  }
}
