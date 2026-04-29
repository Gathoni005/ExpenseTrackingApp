import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {  IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { User } from '../../interfaces/event';
import { addIcons } from 'ionicons';
import { mail, lockClosed, eye, eyeOff } from 'ionicons/icons';
import { TogglePassword } from 'src/app/directives/toggle-password';

addIcons({ mail, lockClosed, eye, eyeOff });

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.page.html',
  styleUrls: ['./login-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem, IonInput, IonButton, IonIcon,CommonModule, FormsModule, TogglePassword
  ]
})
export class LoginPage implements OnInit {
newUser: User = {
    email: 'ruthgg@gmail.com',
    password: '12345678'
  };

 constructor(private router: Router) {}

  ngOnInit() {}


  login() {
    if (!this.newUser.email || !this.newUser.password) {
      console.log('Please fill all fields');
      return;
    }

    console.log('Logging in user:', this.newUser);

   this.router.navigate(['/event-registration']);
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }
}