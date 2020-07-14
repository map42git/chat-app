import { Component, OnInit, Input, Output, EventEmitter, Directive } from "@angular/core";
import { UserHookService } from "src/app/services/userHook.service";
import { AngularFirestore } from 'angularfire2/firestore';
import { TextcutterService } from 'src/app/services/textcutter.service';
import { Chat } from 'src/models/chat.model';
@Component({
  selector: "app-chat-room-item",
  templateUrl: "./chat-room-item.component.html",
  styleUrls: ["./chat-room-item.component.scss"],
})
export class ChatRoomItemComponent implements OnInit {
  @Input() room: any;
  @Input() activeChatId: string
  @Output() roomChanged = new EventEmitter<Chat>();
  @Output() removeChat = new EventEmitter<string>();
  editMode: boolean;
  name: string;
  userName: any;
  constructor(public hook: UserHookService, private afs: AngularFirestore, public text: TextcutterService) { }
  ngOnInit() {
    this.userName = this.text.normalize(this.room.userName, 20, "...")
  }
  getMessages() {
    this.roomChanged.emit(this.room);
  }
  editName(value, id) {
    this.editMode = value,
      setTimeout(() => {
        document.getElementById(id).focus()
      });
  }
  keyDownHandler(evt) {
    evt.keyCode == 13 ? this.updateName() : ""
  }
  updateName() {
    this.name = this.name?.trim()
    this.name ?
      this.afs.collection("Chats").doc(this.room?.chatId).update({
        userName: this.name,
      }).then(() => {
        this.userName = this.name
        this.room.userName = this.name
        this.roomChanged.emit(this.room);
      }).then(() => {
        this.afs.collection("Users").doc(this.room?.userId).update({
          name: this.name
        })
      }) : ''
    this.editMode = false
  }
}
