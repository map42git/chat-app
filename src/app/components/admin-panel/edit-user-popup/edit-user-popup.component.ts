import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'src/models/user.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { HttpClient } from '@angular/common/http';
import { ApproveActionComponent } from '../../popups/approve-action/approve-action.component';

@Component({
  selector: 'app-edit-user-popup',
  templateUrl: './edit-user-popup.component.html',
  styleUrls: ['./edit-user-popup.component.scss']
})
export class EditUserPopupComponent implements OnInit {
  name: string;
  selectedRole: string;
  password: string;
  email: string;
  constructor(@Inject(MAT_DIALOG_DATA) public user: any, private afs: AngularFirestore, private dialog: MatDialog, private httpClient: HttpClient) {
    this.name = user?.name
    this.selectedRole = user?.role
    this.email = user?.email
  }

  ngOnInit(): void {
  }
  update() {
    this.afs.collection("Users").doc(this.user.id).update({
      name: this.name,
      role: this.selectedRole,
      email: this.email
    }).then(() => { this.password ? this.updateUser() : this.dialog.closeAll() });

  }
  updateUser() {
    this.httpClient.post("https://us-central1-upstartchat.cloudfunctions.net/updateUser", { uid: this.user.uid, password: this.password, email: this.email }).subscribe(() => {
      this.dialog.closeAll()
    })
  }
  deleteUser() {
    const approve = this.dialog.open(ApproveActionComponent, {
      data: 'האם למחוק את המשתמש?'
    });
    approve.afterClosed().subscribe(answer => {
      answer ? this.httpClient.post("https://us-central1-upstartchat.cloudfunctions.net/deleteUser", { uid: this.user.uid }).subscribe(() => {
        this.afs.collection("Users").doc(this.user.id).delete().then(() => { this.dialog.closeAll() });
      }, () => {
        this.dialog.closeAll()
      }) : this.dialog.closeAll()
    })

  }
}
