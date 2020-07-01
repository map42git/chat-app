import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextcutterService {

  constructor() { }
  normalize(text: string, length: number, symbol: string) {
    let normalizedText: string;
    text && text.length > length ? normalizedText = text.substr(0, length).concat(symbol) : normalizedText = text
    return normalizedText
  }
}
