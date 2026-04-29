import { Directive } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import { Input } from '@angular/core';
import { HostListener } from '@angular/core';
@Directive({
  selector: '[appTogglePassword]',
  standalone: true
})
export class TogglePassword {

  constructor() { }

   @Input('appTogglePassword') input!: IonInput;

  private isVisible = false;

  @HostListener('click')
  toggle() {
    this.isVisible = !this.isVisible;
    this.input.type = this.isVisible ? 'text' : 'password';
  }

}
