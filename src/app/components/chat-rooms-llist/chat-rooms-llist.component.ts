import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ChatService } from 'src/app/services/chat.service';
import { Chat } from 'src/models/chat.model';
import { UserHookService } from 'src/app/services/userHook.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: "app-chat-rooms-llist",
  templateUrl: "./chat-rooms-llist.component.html",
  styleUrls: ["./chat-rooms-llist.component.scss"],
})
export class ChatRoomsLlistComponent {
  searchValue = ''
  filteredRooms: Chat[]
  rooms: Chat[]
  @Input() activeChatId: string;
  @Input() actualUserId: string;
  choosenStatus: string;
  @Input('rooms') set _rooms(value: Chat[]) {
    this.rooms = value;
    this.doSearch('')
  };
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  @Output() filterStatus = new EventEmitter<string>();

  constructor(public counter: ChatService, private hook: UserHookService, private auth: AuthService) { }

  ngOnInit() { }
  doSearch(value) {
    value ? this.filteredRooms = this.rooms?.filter(room => this.hook.getUserById(room.userId).name.toLocaleLowerCase().includes(value.toLocaleLowerCase())) : this.filteredRooms = this.rooms;
    if (!this.filteredRooms?.length) {
      this.filteredRooms = this.rooms?.filter(room => this.hook.getUserById(room.userId).mobileNumber.includes(value))
    }
  }
  // searchByPhoneNumber(value): Chat[] {
  //   console.log(value);
  //   console.log(this.rooms);
  //   let searchResult: Chat[] = [];
  //   for (let index = 0; index < this.rooms.length; index++) {
  //     this.rooms[index].chatChannelId.includes(value) ?
  //       searchResult.push(this.rooms[index]) : ''
  //   }
  //   return searchResult
  // }

  showByStatus(status) {
    this.choosenStatus = status
    // this.counter.getChatsCountByStatus(status, this.actualUserId) > 0 ?
      this.filterStatus.emit(status)
      //  : ''
  }
  deleteChat(id) {
    this.removeChat.emit(id);
  }
  chatRoomChanged(room) {
    this.roomChanged.emit(room);
  }
  availableChats(chats) {
    const userRole = this.auth.getUserInfo()?.role
    let chatList;
    userRole == 'admin' || userRole == 'manager' ?
      chatList = chats : chatList = chats?.filter(x => x.assignedUserId == this.actualUserId)
    return chatList
  }
}
