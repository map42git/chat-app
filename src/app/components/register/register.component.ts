import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  email: string;
  password: string;
  passwordRepeat: string
  registerPage: boolean;
  errorMessage: any;
  constructor(private router: Router) { this.registerPage = true }

  ngOnInit(): void {
  }
  register() {
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(() => {
      this.router.navigate(['dashboard'])
    }).catch(error => {
      this.errorMessage = error.message;
    })
  }
}
