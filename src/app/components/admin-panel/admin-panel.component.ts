import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { UserHookService } from 'src/app/services/userHook.service';
import { MatDialog } from '@angular/material/dialog';
import { EditUserPopupComponent } from './edit-user-popup/edit-user-popup.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: any;
  usersWithRoles: any;
  userListFull: any;
  constructor(private router: Router, public hook: UserHookService, private dialog: MatDialog, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getUsersAuth()
  }
  editUser(user) {
    const dialog = this.dialog.open(EditUserPopupComponent, { data: user });
    dialog.afterClosed().subscribe(() => {
      this.ngOnInit()
    })
  }
  toDashboard() {
    this.router.navigate(['dashboard'])
  }
  createUserListWithAllProps() {
    var hash = new Map();
    this.users.concat(this.usersWithRoles).forEach(function (obj) {
      hash.set(obj.email, Object.assign(hash.get(obj.email) || {}, obj))
    });
    this.userListFull = Array.from(hash.values());
    console.log(this.userListFull);
  }
  getUsersWithRoles() {
    this.usersWithRoles = this.hook.users.value.filter((x) => x.role == 'admin' || x.role == 'manager' || x.role == 'employee');
  }
  getUsersAuth() {
    this.httpClient.post("https://us-central1-upstartchat.cloudfunctions.net/getAllUsers", null).subscribe(res => {
      this.users = res;
      this.getUsersWithRoles()
      this.createUserListWithAllProps()
    })
  }
  logout() {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['login'])
    }).catch(error => alert(error))
  }
}