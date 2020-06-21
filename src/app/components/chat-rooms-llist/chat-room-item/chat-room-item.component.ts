import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UserHookService } from "src/app/services/userHook.service";
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: "app-chat-room-item",
  templateUrl: "./chat-room-item.component.html",
  styleUrls: ["./chat-room-item.component.scss"],
})
export class ChatRoomItemComponent implements OnInit {
  @Input() room: any;
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  editMode: boolean;
  name: string;
  constructor(public hook: UserHookService, private afs: AngularFirestore,) { }

  ngOnInit() { }
  deleteChat(id) {
    this.removeChat.emit(id);
  }
  getMessages(id) {
    this.roomChanged.emit(id);
  }
  editName(value) {
    this.editMode = value
  }
  updateName() {
    this.afs.collection("Chats").doc(this.room.chatId).update({
      name: this.name || this.room.name,
    })
    this.editMode = false
  }
}
