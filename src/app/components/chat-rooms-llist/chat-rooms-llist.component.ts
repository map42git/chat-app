import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: "app-chat-rooms-llist",
  templateUrl: "./chat-rooms-llist.component.html",
  styleUrls: ["./chat-rooms-llist.component.scss"],
})
export class ChatRoomsLlistComponent {
  @Input() rooms: any;
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  @Output() filterStatus = new EventEmitter<string>();
  constructor(public counter: ChatService) { }

  ngOnInit() { }
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
