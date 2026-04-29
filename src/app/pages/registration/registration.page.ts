import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonIcon  } from '@ionic/angular/standalone';
import { User } from 'src/app/interfaces/event';
import { TogglePassword } from 'src/app/directives/toggle-password';
import {addIcons} from 'ionicons';
import { mail, lockClosed, eye, eyeOff } from 'ionicons/icons';

addIcons({ mail, lockClosed, eye, eyeOff });

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonIcon, CommonModule, FormsModule, TogglePassword]
})
export class RegistrationPage implements OnInit {

  newUser: User = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errorMessage = '';

  constructor(private router: Router) {}

  ngOnInit() {}

  register() {

    // 1. Check empty fields
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // 2. Check password match
    if (this.newUser.password !== this.newUser.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // 3. Password length check
    if (this.newUser.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    // Success
    this.errorMessage = '';
    console.log('User Registered:', this.newUser);

    // Navigate to login
    this.router.navigate(['/login-page']);
  }
}