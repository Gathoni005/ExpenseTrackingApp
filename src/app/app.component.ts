import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { MenuStateService } from './services/menu-state.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonMenuToggle,
    IonRouterOutlet
  ],
})
export class AppComponent {
  private router = inject(Router);
  private menuController = inject(MenuController);
  private menuStateService = inject(MenuStateService);

  // Used by sidebar items to close the menu, update menu state, then navigate.
  async goTo(path: string) {
    await this.menuController.close('main-menu');
    this.menuStateService.setMenuOpen(false);
    await this.router.navigate([path]);
  }

  // Keep shared menu state in sync so pages can hide/show menu button.
  onMenuDidOpen() {
    this.menuStateService.setMenuOpen(true);
  }

  onMenuDidClose() {
    this.menuStateService.setMenuOpen(false);
  }
}
