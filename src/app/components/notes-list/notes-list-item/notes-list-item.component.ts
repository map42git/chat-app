import { Note } from "./../../../../models/note.model";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-notes-list-item",
  templateUrl: "./notes-list-item.component.html",
  styleUrls: ["./notes-list-item.component.scss"],
})
export class NotesListItemComponent implements OnInit {
  @Input() note: Note;
  @Input() chatId: string;
  @Output() removeNote = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}
  deleteNote(id) {
    this.removeNote.emit(id);
  }
}
