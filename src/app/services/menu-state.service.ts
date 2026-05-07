import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  // Shared state for menu visibility so child pages can react to it.
  private readonly menuOpenSubject = new BehaviorSubject<boolean>(false);
  readonly menuOpen$ = this.menuOpenSubject.asObservable();

  setMenuOpen(isOpen: boolean) {
    this.menuOpenSubject.next(isOpen);
  }
}
