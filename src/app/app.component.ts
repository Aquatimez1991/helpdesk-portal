import { Component, DestroyRef, effect, HostListener, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { TicketStore } from './tickets/ticket.store';
import { WorkspaceUi } from './workspace-ui.service';
import { TicketCreateComponent } from './tickets/ticket-create.component';
@Component({
  selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive, TicketCreateComponent, A11yModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly store = inject(TicketStore);
  readonly ui = inject(WorkspaceUi);
  readonly router = inject(Router);
  readonly mobileNav = signal(false);
  readonly notifications = signal(false);
  readonly section = signal('Visión general');
  private previousPath = '';
  @HostListener('document:keydown.escape') closeMenus() { this.mobileNav.set(false); this.notifications.set(false); }
  readonly nav = [
    { label: 'Visión general', path: '/overview', icon: 'pi pi-th-large' },
    { label: 'Bandeja de tickets', path: '/tickets', icon: 'pi pi-inbox' },
    { label: 'Mis asignaciones', path: '/mine', icon: 'pi pi-user' },
    { label: 'Actividad', path: '/activity', icon: 'pi pi-history' },
    { label: 'Equipo', path: '/team', icon: 'pi pi-users' },
  ];
  constructor() {
    const destroy = inject(DestroyRef);
    interval(60000).pipe(takeUntilDestroyed(destroy)).subscribe(() => this.store.now.set(Date.now()));
    this.router.events.pipe(takeUntilDestroyed(destroy)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileNav.set(false); this.notifications.set(false);
        this.section.set(this.nav.find(n => event.urlAfterRedirects.startsWith(n.path))?.label ?? 'Configuración');
        const path = event.urlAfterRedirects.split('?')[0];
        if (path !== this.previousPath && !/^\/tickets\/[^/]+$/.test(path)) document.getElementById('main-content')?.focus({ preventScroll: true });
        this.previousPath = path;
      }
    });
    effect(onCleanup => {
      if (!this.store.toast()) return;
      const timeout = setTimeout(() => this.store.toast.set(''), 5500);
      onCleanup(() => clearTimeout(timeout));
    });
  }
  search(value: string) { void this.router.navigate(['/tickets'], { queryParams: value.trim() ? { q: value.trim() } : {} }); }
  created(id: string) { this.ui.creating.set(false); void this.router.navigate(['/tickets', id]); }
}
