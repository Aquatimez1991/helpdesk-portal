import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { TicketRepository } from './tickets/ticket.repository';
import { createDemoTickets } from './tickets/ticket.fixtures';
describe('Cyberdesk workspace', () => {
  it('exposes cybersecurity navigation, a visible demo label and ticket creation', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], providers: [provideRouter([]), { provide: TicketRepository, useValue: { read: () => createDemoTickets(), save: () => undefined } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('nav')?.textContent).toContain('Bandeja de tickets');
    expect(element.querySelector('.demo-tag')?.textContent).toContain('Demo local');
    expect(element.querySelector('main')?.id).toBe('main-content');
    fixture.destroy();
  });
});
