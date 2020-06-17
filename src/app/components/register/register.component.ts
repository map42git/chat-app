import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { User } from 'src/models/user.model';
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
  selectedItem: string = 'employee'
  usersCollection: AngularFirestoreCollection<User>;
  name: string
  constructor(private router: Router, private afs: AngularFirestore) { this.registerPage = true }

  ngOnInit(): void {
  }
  register() {
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(() => {
      alert('You`ve just created a user!')
      this.createDbUser();
    }).catch(error => {
      this.errorMessage = error.message;
    })

  }

  createDbUser() {
    this.usersCollection = this.afs.collection<User>("Users");
    const userModel = new User();
    userModel.createdOn = new Date().getTime().toString();
    userModel.facebookEmail = "";
    userModel.id = "";
    userModel.role = this.selectedItem;
    userModel.mobileNumber = "";
    userModel.name = this.name;
    userModel.email = this.email
    this.usersCollection.add({ ...userModel });
  }
}
