import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { UserHookService } from 'src/app/services/userHook.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: any;
  constructor(private router: Router, public hook: UserHookService) { }

  ngOnInit(): void {
    this.users = this.hook.users.value.filter((x) => x.role == 'admin' || x.role == 'manager' || x.role == 'employee');
  }
  toDashboard() {
    this.router.navigate(['dashboard'])
  }
  logout() {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['login'])
    }).catch(error => alert(error))
  }
}
