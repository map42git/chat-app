import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'src/models/user.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { HttpClient } from '@angular/common/http';
import { ApproveActionComponent } from '../../popups/approve-action/approve-action.component';
import { LoadingService } from 'src/app/services/loading.service';

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
  inactive: boolean;
  constructor(@Inject(MAT_DIALOG_DATA) public user: any, private afs: AngularFirestore, private dialog: MatDialog, private httpClient: HttpClient, private loading: LoadingService) {
    this.name = user?.name
    this.selectedRole = user?.role
    this.email = user?.email
    user?.uid ? this.inactive = false : this.inactive = true
  }

  ngOnInit(): void {
  }
  update() {


    this.afs.collection("Users").doc(this.user.id).update({
      name: this.name,
      role: this.selectedRole,
      email: this.email
    }).then(() => {
      this.password ? this.updateUser() : this.dialog.closeAll();
    });

  }
  updateUser() {
    this.loading.startSpinner()
    this.httpClient.post("https://us-central1-upstartchat.cloudfunctions.net/updateUser", { uid: this.user.uid, password: this.password, email: this.email }).subscribe(() => {
      this.dialog.closeAll()
      this.loading.stopSpinner()
    }, error => {
      this.loading.stopSpinner()
    })
  }
  deleteUser() {
    const approve = this.dialog.open(ApproveActionComponent, {
      data: 'האם למחוק את המשתמש?'
    });
    approve.afterClosed().subscribe(answer => {
      this.loading.startSpinner()
      if (answer) {
        if (this.inactive) {
          this.afs.collection("Users").doc(this.user.id).delete().then(() => { this.dialog.closeAll(), this.loading.stopSpinner() });
        } else {
          this.httpClient.post("https://us-central1-upstartchat.cloudfunctions.net/deleteUser", { uid: this.user.uid }).subscribe(() => {
            this.loading.stopSpinner()
            this.afs.collection("Users").doc(this.user.id).delete().then(() => { this.dialog.closeAll() });
          }, () => {
            this.loading.stopSpinner()
            this.dialog.closeAll()
          })
        }
      } else this.dialog.closeAll(), this.loading.stopSpinner()
    })

  }
}
