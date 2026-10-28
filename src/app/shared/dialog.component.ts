import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-dialog', imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="dialog-backdrop" (click)="backdrop($event)">
      <section class="dialog" [class.drawer]="drawer" role="dialog" aria-modal="true"
        [attr.aria-label]="title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <button class="icon-button dialog-close" aria-label="Cerrar diálogo" (click)="closed.emit()"><i class="pi pi-times" aria-hidden="true"></i></button>
        <ng-content />
      </section>
    </div>`,
})
export class DialogComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly inactive: { element: HTMLElement; previous: boolean }[] = [];
  @Input({ required: true }) title = '';
  @Input() drawer = false;
  @Output() closed = new EventEmitter<void>();
  ngOnInit() {
    let element = this.host.nativeElement;
    while (element.parentElement) {
      for (const sibling of Array.from(element.parentElement.children)) {
        if (sibling !== element && sibling instanceof HTMLElement) {
          this.inactive.push({ element: sibling, previous: sibling.inert });
          sibling.inert = true;
        }
      }
      if (element.parentElement === document.body) break;
      element = element.parentElement;
    }
  }
  ngOnDestroy() { for (const entry of this.inactive) entry.element.inert = entry.previous; }
  @HostListener('document:keydown.escape') escape() { this.closed.emit(); }
  backdrop(event: MouseEvent) { if (event.target === event.currentTarget) this.closed.emit(); }
}
