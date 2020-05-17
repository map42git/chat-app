import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ChatService } from 'src/app/services/chat.service';
import { Chat } from 'src/models/chat.model';
import { UserHookService } from 'src/app/services/userHook.service';

@Component({
  selector: "app-chat-rooms-llist",
  templateUrl: "./chat-rooms-llist.component.html",
  styleUrls: ["./chat-rooms-llist.component.scss"],
})
export class ChatRoomsLlistComponent {
  searchValue = ''
  filteredRooms: Chat[]
  @Input() rooms: Chat[];
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  @Output() filterStatus = new EventEmitter<string>();
  constructor(public counter: ChatService, private hook: UserHookService) { }

  ngOnInit() { }
  doSearch(value) {
    value ?
      this.filteredRooms = this.rooms.filter(room => this.hook.getUserById(room.userId).name.includes(value)) : this.filteredRooms = this.rooms
  }
  showByStatus(status) {
    this.filterStatus.emit(status);
  }
  deleteChat(id) {
    this.removeChat.emit(id);
  }
  chatRoomChanged(id) {
    this.roomChanged.emit(id);
  }
}
