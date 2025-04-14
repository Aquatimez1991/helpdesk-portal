import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DropdownModule,
    CardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  roles = [
    { label: 'Agente', value: 'Agente' },
    { label: 'Analista Técnico', value: 'Analista' },
    { label: 'Empleado', value: 'Empleado' },
    { label: 'Mantenimiento', value: 'Mantenimiento' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: [null, Validators.required]
    });
  }

  onSubmit() {
    const { username, password, role } = this.form.value;
  
    if (!username || !password || !role) return;
  
    const success = this.auth.login(username, password, role);
  
    if (success) {
      const roleRoutes: Record<string, string> = {
        Agente: 'agent',
        Analista: 'analyst',
        Empleado: 'employee',
        Mantenimiento: 'maintenance'
      };
  
      this.router.navigate([`/dashboard/${roleRoutes[role]}`]);
    } else {
      this.error = 'Credenciales inválidas o rol no válido';
    }
  }
  
  
}
