import { Component } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
} from "angularfire2/firestore";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { ChatRecord } from "src/models/message.model";
import { Chat } from "src/models/chat.model";
import { Note } from "src/models/note.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  messagesCollection: AngularFirestoreCollection<ChatRecord>;
  messages: Observable<ChatRecord[]>;
  notesCollection: AngularFirestoreCollection<Note>;
  notes: Observable<Note[]>;
  chatsCollection: AngularFirestoreCollection<Chat>;
  chats: Observable<Chat[]>;
  sortedMessages: ChatRecord[];
  readyChats: Chat[];
  activeChatId: any;
  constructor(
    private sidebarService: NbSidebarService,
    private afs: AngularFirestore
  ) {
    this.messagesCollection = this.afs.collection<ChatRecord>("ChatRecords");
  }
  ngOnInit() {
    this.getChats();
  }
  // notes
  getNotes() {
    this.notesCollection = this.afs.collection<Note>("Notes");
    this.notes = this.notesCollection.valueChanges<string>({
      idField: "noteId",
    });
  }
  newNote(note) {
    if (this.activeChatId) {
      const noteModel = new Note();
      noteModel.chatId = this.activeChatId;
      noteModel.chatNoteId = "";
      noteModel.createdOn = new Date().getTime().toString();
      noteModel.details = note;
      noteModel.userId = "";
      this.notesCollection.add({ ...noteModel });
    } else {
      alert("choose or create chat fisrt!");
    }
  }
  notesChange(event) {
    console.log('notes change"', event);
  }
  //
  
  //messages
  getRoomMesages(event) {
    this.activeChatId = event;
    this.messages = this.messagesCollection
      .valueChanges<string>({
        idField: "chatRecordId",
      })
      .pipe(
        map((messages) => {
          return messages
            .filter((msg) => msg.chatId === event)
            .sort(this.compare);
        })
      );
  }
  newMessage(message) {
    if (this.activeChatId) {
      const messsageModel = new ChatRecord();
      messsageModel.details = message.message;
      messsageModel.createdOn = new Date().getTime().toString();
      messsageModel.userId = "";
      messsageModel.chatRecordId = "";
      messsageModel.chatId = this.activeChatId;
      messsageModel.isHomeRecord = false;
      this.messagesCollection.add({ ...messsageModel });
    } else {
      alert("choose or create chat fisrt!");
    }
  }
  //

  // chats
  newChat() {
    const chatModel = new Chat();
    chatModel.chatChannelId = "";
    chatModel.chatId = "";
    chatModel.chatStatusId = "";
    chatModel.createdOn = new Date().getTime().toString();
    chatModel.userId = "";
    this.chatsCollection.add({ ...chatModel });
  }
  getChats() {
    this.chatsCollection = this.afs.collection<Chat>("Chats");
    this.chats = this.chatsCollection.valueChanges<string>({
      idField: "chatId",
    });
  }
  //

  // helpers
  toggle() {
    this.sidebarService.toggle(false, "left");
  }
  toggleNotes() {
    this.sidebarService.toggle(false, "right");
  }
  compare(a, b) {
    if (a.createdOn > b.createdOn) return 1;
    if (b.createdOn > a.createdOn) return -1;
    return 0;
  }
  //
}
