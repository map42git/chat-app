import { Note } from "./../../../../models/note.model";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-notes-list-item",
  templateUrl: "./notes-list-item.component.html",
  styleUrls: ["./notes-list-item.component.scss"],
})
export class NotesListItemComponent implements OnInit {
  @Input() note: Note;
  @Output() noteChanged = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}
  noteChange(id) {
    this.noteChanged.emit(id);
  }
}
