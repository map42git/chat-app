import { Component, OnInit } from "@angular/core";
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from "angularfire2/firestore";
// import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";
import { ChatRecord } from "src/models/message.model";
import { Note } from "src/models/note.model";
import { Chat } from "src/models/chat.model";
import {
  NbSidebarService,
  NbLayoutDirectionService,
  NbThemeService,
  NbLayoutDirection,
} from "@nebular/theme";
import { HttpService } from "src/app/services/http.service";
import { Router } from "@angular/router";
import * as firebase from "firebase";
import { Http } from "@angular/http";
import { AuthService } from "src/app/services/auth.service";
import { UserHookService } from "src/app/services/userHook.service";
import { TextcutterService } from "src/app/services/textcutter.service";
import { formatCurrency } from '@angular/common';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  usersCollection: any;
  users: BehaviorSubject<User[]>;
  messagesCollection: AngularFirestoreCollection<ChatRecord>;
  messages: BehaviorSubject<ChatRecord[]>;
  notesCollection: AngularFirestoreCollection<Note>;
  notes: BehaviorSubject<Note[]>;
  chatsCollection: any;
  chats: BehaviorSubject<Chat[]>;
  sortedMessages: ChatRecord[];
  readyChats: Chat[];
  activeChatId: any;
  actualUserId: string;
  actualUser: User;
  videoChatMode: Boolean = true;
  chatSize: any;
  isFrameExpanded: any;
  darkMode: Boolean = false;
  roomUrlWithToken: string;
  shareUrl: any;
  roomUrl: any;
  activeChat: Chat;
  adminAccess: boolean;
  usersWithRoles: User[];
  tempChatsFilteredByStatus: Chat[];
  messagesCollectionRequest: any;
  lastVisible: any;
  lastVisibleInit: any;
  db: any;
  bottomButton: boolean = false;
  buttonLoadMoreAvailable: boolean;
  notesListenerUnsubscribe: any;
  chatRecordsListenerUnsubscribe: any;
  usersUnsubscribe: any;
  chatsUnsubscribe: any;
  choosenStatus: any;
  constructor(
    private sidebarService: NbSidebarService,
    private afs: AngularFirestore,
    private directionService: NbLayoutDirectionService,
    private themeService: NbThemeService,
    private http: HttpService,
    private router: Router,
    private httpClient: Http,
    private auth: AuthService,
    public hook: UserHookService,
    public text: TextcutterService,
    public counter: ChatService
  ) {
    this.db = firebase.firestore();
    this.directionService.setDirection(NbLayoutDirection.RTL);
    this.messages = new BehaviorSubject([]);
    this.users = new BehaviorSubject([]);
    this.notes = new BehaviorSubject([]);
    this.chats = new BehaviorSubject([]);
  }
  ngOnInit() {
    this.getUsers();
    this.http.getAccessToken().then(() => {
      this.http.get("room", "create").subscribe((res) => {
        this.roomUrl = res.roomUrl;
        this.roomUrlWithToken = `${res.roomUrl}?pwd=${this.http.accessToken}`;
      });
    });
  }

  //users
  getUsers() {
    this.usersUnsubscribe = this.db
      .collection("Users").onSnapshot(querySnapshot => {
        let users = [];
        querySnapshot.docs.forEach(doc => {
          users.push({ ...doc.data(), id: doc.id });
        });
        this.users.next(users);
        this.usersWithRoles = this.users?.value?.filter(
          (x) =>
            x.role == "admin" || x.role == "manager" || x.role == "employee"
        );
        this.actualUserId = this.auth.getUserInfo()?.id;
        this.actualUser = this.hook.getUserById(this.actualUserId)
        this.actualUser?.role == "manager" ||
          this.actualUser?.role == "admin"
          ? (this.adminAccess = true)
          : (this.adminAccess = false);
        this.getChats();
        this.usersUnsubscribe()
      });
  }
  getUserById(id) {
    return this.users.value.find((_user) => _user.id === id);
  }

  //notes
  getNotes() {
    this.notesListenerUnsubscribe = this.db.collection('Notes').where('chatId', '==', this.activeChatId).orderBy("createdOn", "desc").onSnapshot((querySnapshot) => {
      let notes = [];
      querySnapshot.docs.forEach((doc) => {
        notes.push({ ...doc.data(), chatNoteId: doc.id });
      });
      this.notes.next(notes);
    });
  }
  newNote(note) {
    if (this.activeChatId) {
      const noteModel = new Note();
      noteModel.chatId = this.activeChatId;
      noteModel.chatNoteId = "";
      noteModel.createdOn = new Date().getTime().toString();
      noteModel.details = note;
      noteModel.userId = this.actualUserId;
      this.db.collection("Notes").add({ ...noteModel });
    } else {
      alert("choose or create chat fisrt!");
    }
  }
  removeNote(event) {
    this.afs.collection<Note>("Notes").doc(event).delete();
  }

  //messages
  getMoreMessages() {
    this.db
      .collection("ChatRecords")
      .where("chatId", "==", this.activeChatId)
      .orderBy("createdOn", "desc")
      .startAt(this.lastVisible)
      .limit(10).get().then((querySnapshot) => {
        if (
          querySnapshot.docs.length > 1
        ) {
          this.lastVisible =
            querySnapshot.docs[querySnapshot.docs.length - 1];
          this.lastVisible.chatRecordId = querySnapshot.docs[querySnapshot.docs.length - 1].id;
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            item.chatRecordId = doc.id;
            if (item.chatRecordId != this.lastVisible.chatRecordId) {
              // combine
              this.deleteMessageFromMessages(item)
              this.messages.value.unshift(item);
            } else {
              console.error('I`m not working as designed! CHECK ME PLEASE');
            }
            let chatArea = document.getElementsByClassName("scrollable")[0];
            chatArea.addEventListener('scroll', () => {
              if (chatArea.scrollHeight - chatArea.scrollTop <= 1500) {
                this.bottomButton = false
              } else {
                this.bottomButton = true
              }
            })
            setTimeout(() => {
              document.getElementsByClassName("scrollable")[0]?.scroll(0, 0);
              this.bottomButton = true
            }, 200);
          });
        } else {
          this.buttonLoadMoreAvailable = false
        }
      });
  }

  getRoomMesages(chat?: Chat) {
    // combine to reset input value when redirect to another chat room
    // document.getElementsByTagName('input')[0].value = ''
    if (chat && this.activeChatId != chat?.chatId) {
      this.activeChatId = chat.chatId
      this.activeChat = chat

      var messages = [];

      // if (this.actualUser?.role == 'manager' || this.actualUser?.role == 'admin') {
      //   var messagesRef = this.db
      //     .collection("ChatRecords")
      //     .where("chatId", "==", chat?.chatId)
      //     .orderBy("createdOn", "desc")
      //     .limit(10)
      // } else {
      var messagesRef = this.db
        .collection("ChatRecords");
      messagesRef = messagesRef
        .where("chatId", "==", chat?.chatId)
        // messagesRef = messagesRef.where("assignedUserId", "==", this.actualUser?.id)
        .orderBy("createdOn", "desc")
        .limit(10)
      // }
      messagesRef.get().then(docs => {
        docs.forEach(doc => {
          messages.unshift(doc.data())
        });
        this.lastVisible = docs.docs[docs.docs.length - 1];
      }).then(() => {
        this.messages.next(messages);
        this.activeChatId = chat?.chatId
        this.chats?.subscribe((chats) => {
          this.activeChat = chats.filter((x) => x.chatId == chat.chatId)[0];
        })
        this.getNotes();
        this.scrollChatAreaToTheBottom();
        this.buttonLoadMoreAvailable = true
      }).then(() => {
        this.chatRecordsListenerUnsubscribe = this.db
          .collection("ChatRecords")
          .orderBy("createdOn", "desc")
          .limit(1).onSnapshot((querySnapshot) => {
            // if new message from actual chat ►►► push
            let newMessage = querySnapshot.docs[0].data();
            if (this.activeChatId == newMessage.chatId) {
              if (JSON.stringify(this.messages.value[this.messages.value.length - 1]) != JSON.stringify(newMessage)) {
                // combine
                this.deleteMessageFromMessages(newMessage)
                messages.push(newMessage)
                this.updateHTML();
              }
            } else
            // new message from another chat          
            {
              for (let i = 0; i < this.tempChatsFilteredByStatus.length; i++) {
                if (this.tempChatsFilteredByStatus[i].chatId == newMessage.chatId) {
                  this.db.collection("Chats").doc(newMessage.chatId).get().then(chat => {
                    this.tempChatsFilteredByStatus[i].unreadMessages = chat.data().unreadMessages;
                    this.tempChatsFilteredByStatus[i].lastActivity = new Date().getTime().toString(),
                      // Combine to make a notification red mark on the related to newMessage chat room 
                      // (it makes without combine but performs only after chats listener fetches event from FB)
                      this.tempChatsFilteredByStatus.push(this.tempChatsFilteredByStatus[i])
                    this.tempChatsFilteredByStatus.pop()
                    this.tempChatsFilteredByStatus.sort((a, b) => (a.lastActivity > b.lastActivity) ? -1 : 1)
                    this.updateHTML();
                    //
                  });
                }
              }
            }
            if (this.activeChat.chatStatusId !== 'active') {
              for (let index = 0; index < this.tempChatsFilteredByStatus.length; index++) {
                if (this.tempChatsFilteredByStatus[index].chatId == newMessage.chatId) {
                  this.tempChatsFilteredByStatus.splice(index, 1)
                  this.db.collection("Chats").doc(newMessage.chatId).update({
                    chatStatusId: 'active'
                  })
                  for (let index = 0; index < this.chats.value.length; index++) {
                    if (this.chats.value[index].chatId == newMessage.chatId) {
                      this.chats.value[index].chatStatusId = 'active'
                    }
                  }
                }
              }
            }
          });
      })
    }
  }

  newMessage(message) {
    const files = !message.files
      ? []
      : message.files.map((file) => {
        return {
          url: file.src,
          type: file.type,
          icon: "file-text-outline",
        };
      });
    if (this.activeChatId) {
      const messsageModel = new ChatRecord();
      messsageModel.details = message.message;
      messsageModel.createdOn = new Date().getTime().toString();
      messsageModel.userId = this.actualUserId;
      messsageModel.chatRecordId = "";
      messsageModel.chatId = this.activeChatId;
      messsageModel.files = files.length ? files : null;
      (messsageModel.type = files.length ? "file" : "text"),
        (messsageModel.isHomeRecord = true);
      this.db.collection("ChatRecords").add({ ...messsageModel }).then(() => {
        this.messagePending(true)
      });
      this.afs.collection("Chats").doc(this.activeChatId).update({
        lastActivity: new Date().getTime().toString(),
      });
      this.httpClient
        .post(
          "https://us-central1-upstartchat.cloudfunctions.net/addMessageToUser",
          messsageModel
        )
        .subscribe(() => {
          this.messagePending(false)
        });
    } else {
      alert("Choose or create chat first!");
    }
  }

  // chats
  changeStatus(status) {
    this.activeChat.chatStatusId = status;
    this.afs.collection("Chats").doc(this.activeChatId).update({
      chatStatusId: status,
    }).then(() => {
      // this.filterStatus(status)
      for (let index = 0; index < this.tempChatsFilteredByStatus.length; index++) {
        if (this.tempChatsFilteredByStatus[index].chatId == this.activeChat.chatId) {
          this.tempChatsFilteredByStatus.splice(index, 1)
        }
      }
    });

  }
  filterStatus(status) {
    this.choosenStatus = status
    this.tempChatsFilteredByStatus = this.chats?.value?.filter(
      chat => chat.chatStatusId == status
    );
    var chatToShow: Chat;
    for (let index = 0; index < this.tempChatsFilteredByStatus.length; index++) {
      if (this.tempChatsFilteredByStatus[index].assignedUserId == this.actualUser?.id) {
        chatToShow = this.tempChatsFilteredByStatus[index]
      } else {
        chatToShow = null
      }
    }
    // this.getRoomMesages(this.tempChatsFilteredByStatus[0]);
    this.getRoomMesages(chatToShow);
  }
  getChats() {
    this.chatsUnsubscribe = this.db
      .collection("Chats")
      .orderBy("lastActivity", "desc").onSnapshot((querySnapshot) => {
        let chats = [];
        querySnapshot.docs.forEach((doc, idx) => {
          chats.push({ chatId: doc.id, ...doc.data() });
          if (idx === querySnapshot.docs.length - 1) {
            this.chatsUnsubscribe()
          }
        });
        if (!this.chats?.value?.length) {
          this.tempChatsFilteredByStatus = chats;
          this.chats.next(chats);
          !this.activeChatId ? this.filterStatus("new") : "";
        }
      });
  }
  assignTo(userId) {
    this.activeChat.assignedUserId = userId
    this.afs.collection("Chats").doc(this.activeChatId).update({
      assignedUserId: userId,
    });
  }

  //helpers
  messagePending(active: boolean) {
    var lastMessageElement = document.getElementsByTagName('nb-chat-message')[document.getElementsByTagName('nb-chat-message').length - 1]
    if (active) {
      var spinner = document.createElement("span") as HTMLElement;;
      spinner.classList.add("spinner-custom")
      lastMessageElement.prepend(spinner)
    } else {
      lastMessageElement.removeChild(lastMessageElement.childNodes[0])
    }
  }
  scrollChatAreaToTheBottom() {
    setTimeout(() => {
      document.getElementsByClassName("scrollable")[0]?.scroll(0, 50000);
      this.afs.collection("Chats").doc(this.activeChatId).update({
        unreadMessages: 0,
      });
      this.bottomButton = false
      for (let index = 0; index < this.tempChatsFilteredByStatus.length; index++) {
        if (this.tempChatsFilteredByStatus[index].chatId == this.activeChatId) {
          this.tempChatsFilteredByStatus[index].unreadMessages = 0
        }
      }
    }, 200);
  }
  // combine
  deleteMessageFromMessages(item: ChatRecord) {
    for (let index = 0; index < this.messages.value.length; index++) {
      if (this.messages.value[index].createdOn == item.createdOn) {
        this.messages.value.splice(index, 1)
      }
    }
  }
  // combine
  updateHTML() {
    setTimeout(() => {
      let element: HTMLElement = document.getElementsByClassName('notes-card-header')[0] as HTMLElement;
      element.click();
    }, 1500);
  }
  toConsole() {
    this.router.navigate(["console"]);
  }
  logout() {
    if (this.notesListenerUnsubscribe) {
      this.notesListenerUnsubscribe();
    }
    if (this.chatRecordsListenerUnsubscribe) {
      this.chatRecordsListenerUnsubscribe()
    }
    if (this.usersUnsubscribe) {
      this.usersUnsubscribe()
    }
    if (this.chatsUnsubscribe) {
      this.chatsUnsubscribe()
    }
    this.router.navigate(['login'])
    firebase.auth().signOut().then(function () {
      console.log('user successfully logged out');
    }).catch(function (error) {
      console.log('an error occurred while loggin user out: ', error);
    });
  }
  // logout() {

  //   firebase
  //     .auth()
  //     .signOut()
  //     .then(() => {
  //       this.router.navigate(["login"]);
  //     })
  //     .catch((error) => alert(error));
  // }
  // removeChat(event) {
  //   this.afs.collection<Chat>("Chats").doc(event).delete();
  // }
  // expandFrame(event) {
  //   this.isFrameExpanded = event;
  // }
  // toggle() {
  //   this.sidebarService.toggle(false, "right");
  // }
  // toggleNotes() {
  //   this.sidebarService.toggle(false, "left");
  // }
  // toVideoChat() {
  //   this.videoChatMode = !this.videoChatMode;
  // }
  // switchTheme() {
  //   var theme: string;
  //   this.darkMode = !this.darkMode;
  //   this.darkMode ? (theme = "cosmic") : (theme = "default"),
  //     this.themeService.changeTheme(theme);
  // }
  putShareLink() {
    this.shareUrl = null;
    setTimeout(() => {
      this.shareUrl = this.roomUrl;
    }, 100);
  }
}
