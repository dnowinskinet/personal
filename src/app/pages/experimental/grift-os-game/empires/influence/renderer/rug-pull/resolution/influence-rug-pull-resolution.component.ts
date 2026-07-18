import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { RugPullResolutionView } from '../../../../../host/empire-renderer-contract';

@Component({
  selector: 'app-influence-rug-pull-resolution',
  standalone: true,
  templateUrl: './influence-rug-pull-resolution.component.html',
  styleUrl: './influence-rug-pull-resolution.component.scss',
})
export class InfluenceRugPullResolutionComponent implements AfterViewInit {
  @Input({ required: true }) resolution!: RugPullResolutionView;
  @Output() readonly dismiss = new EventEmitter<void>();

  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void {
    const dialog = this.dialog.nativeElement;

    if (dialog.open) {
      return;
    }

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  dismissResolution(event?: Event): void {
    event?.preventDefault();
    this.dismiss.emit();
  }
}
