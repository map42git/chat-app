import { Injectable } from "@angular/core";
@Injectable({
    providedIn: "root",
})
export class TimeService {
    constructor() { }
    dateToTime(date) {
        return new Date(+date)
    }
}