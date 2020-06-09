import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
// require('firebase/auth');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  loginPage: boolean;
  errorMessage: any;
  constructor(
    private router: Router
  ) {
    this.loginPage = true
  }

  ngOnInit(): void {
  }
  login() {
    firebase.auth().signInWithEmailAndPassword(this.email, this.password).catch(error => {
      this.errorMessage = error.message;
    }).then(result => {
      this.router.navigate(['dashboard'])
    })
  }
}
