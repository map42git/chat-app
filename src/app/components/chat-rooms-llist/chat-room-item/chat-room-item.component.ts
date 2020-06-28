import { Component, OnInit, Input, Output, EventEmitter, Directive } from "@angular/core";
import { UserHookService } from "src/app/services/userHook.service";
import { AngularFirestore } from 'angularfire2/firestore';
@Component({
  selector: "app-chat-room-item",
  templateUrl: "./chat-room-item.component.html",
  styleUrls: ["./chat-room-item.component.scss"],
})
export class ChatRoomItemComponent implements OnInit {
  @Input() room: any;
  @Input() activeChatId: string
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  editMode: boolean;
  name: string;
  constructor(public hook: UserHookService, private afs: AngularFirestore) { }

  ngOnInit() { }
  deleteChat(id) {
    this.removeChat.emit(id);
  }
  getMessages(id) {
    this.roomChanged.emit(id);
  }
  editName(value, id) {
    this.editMode = value,
      setTimeout(() => {
        document.getElementById(id).focus()
      });
  }
  updateName() {
    this.afs.collection("Users").doc(this.room.userId).update({
      name: this.name || this.hook.getUserById(this.room.userId)?.name,
    })
    this.editMode = false
  }
}
