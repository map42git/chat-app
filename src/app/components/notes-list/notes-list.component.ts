import { Note } from "./../../../models/note.model";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  AfterViewInit,
} from "@angular/core";

@Component({
  selector: "app-notes-list",
  templateUrl: "./notes-list.component.html",
  styleUrls: ["./notes-list.component.scss"],
})
export class NotesListComponent implements OnInit {
  noteText: String = "";
  searchValue: String = '';
  filteredNotes: Note[];
  @Input() notes: Note[];
  @Input() chatId: string;
  @Output() addNote = new EventEmitter<any>();
  @Output() deleteNote = new EventEmitter<any>();
  @HostListener("document:keydown.enter", ["$event"]) onKeydownHandler() {
    if (this.noteText.length > 3) {
      this.newNote();
    }
  }
  constructor() { }
  doSearch(value) {
    value ?
      this.filteredNotes = this.notes.filter(note => note.details.toLocaleLowerCase().includes(value.toLocaleLowerCase())) : this.filteredNotes = this.notes
  }
  ngOnInit() { }
  newNote() {
    this.addNote.emit(this.noteText);
    this.noteText = "";
  }
  removeNote(event) {
    this.deleteNote.emit(event);
  }
}
