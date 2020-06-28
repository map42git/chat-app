import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { UserHookService } from 'src/app/services/userHook.service';
import { User } from 'src/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
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
  loggedInUser: User;
  constructor(
    private router: Router,
    private hook: UserHookService,
    private auth: AuthService
  ) {
    this.loginPage = true
  }

  ngOnInit(): void {
  }
  login() {
    this.email = this.email.toLocaleLowerCase()
    firebase.auth().signInWithEmailAndPassword(this.email, this.password).catch(error => {
      this.errorMessage = error.message;
    }).then(() => {
      this.auth.setUserInfo(this.hook.getUserByEmail(this.email));
      this.router.navigate(['dashboard'])
    })
  }
}
