import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { LoginComponent } from '../login/login.component'; // Asegúrate de importar el LoginComponent


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,CardModule,ButtonModule, RouterModule, DialogModule, LoginComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  showLoginDialog = false;
}
