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
    let arrNotesElements = document.getElementsByTagName('app-notes-list-item');
    for (let index = 0; index < arrNotesElements.length; index++) {
      if (!arrNotesElements[index].children[0].children[1].textContent.includes(value)) {
        arrNotesElements[index].classList.add('hidden')
      } else {
        arrNotesElements[index].classList.remove('hidden')
      }
    }
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
