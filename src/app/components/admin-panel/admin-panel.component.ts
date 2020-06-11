import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  toConsole() {
    this.router.navigate(['console'])
  }
  logout() {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['login'])
    }).catch(error => alert(error))
  }
}
