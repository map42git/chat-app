import { Note } from "./../../../models/note.model";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-notes-list",
  templateUrl: "./notes-list.component.html",
  styleUrls: ["./notes-list.component.scss"],
})
export class NotesListComponent implements OnInit {
  @Input() notes: Note[];
  @Output() noteChanged = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}
  notesChanged(id) {
    this.noteChanged.emit(id);
  }
}
