import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    loading: boolean;
    constructor() { }
    startSpinner() {
        this.loading = true
    }
    stopSpinner() {
        this.loading = false
    }

}
