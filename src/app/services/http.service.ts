import { Injectable } from "@angular/core";
import { Http, RequestOptions, Headers } from "@angular/http";
import { HttpRequest, HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subscriber } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  httpOptions = {
    headers: new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
    }),
  };
  antiforgeryToken: string;
  constructor(private http: Http, private httpClient: HttpClient) {}
  public getAntiforgeryToken<TViewModel>() {
    this.get("token").subscribe(
      (success) => {
        this.antiforgeryToken = success.token;
      },
      (error) => {}
    );
  }
  public get<TViewModel>(
    controller: string,
    action: string = "",
    action2: string = "",
    params?: {},
    host?: string,
    needAntiforgery?: boolean
  ) {
    const url = `${"api"}/${controller}/${action}/${action2}`;
    const watcher = new Observable<any>((observer) => {
      const response = this.http.get(url, this.createOptions(params)).pipe(
        map((res: any) => this.onMap(res)),
        shareReplay(1)
      );
      this.handleResponse(observer, response);
      if (needAntiforgery) {
        this.getAntiforgeryToken();
      }
    });
    return watcher;
  }
  public delete(
    controller: string,
    action: string,
    params?: any,
    host?: string
  ) {
    const url = `${"api"}/${controller}/${action}`;
    const watcher = new Observable<any>((observer) => {
      const response = this.http
        .delete(url, this.createOptions(params))
        .pipe(map((res: any) => this.onMap(res)));
      this.handleResponse(observer, response);
      this.getAntiforgeryToken();
    });
    return watcher;
  }
  public post<TForm>(
    controller: string,
    action: string,
    form?: TForm,
    needToClear?: boolean,
    params?: {},
    host?: string
  ) {
    const url = `${"api"}/${controller}/${action}`;
    const watcher = new Observable<any>((observer) => {
      const response = this.http
        .post(url, form, this.createOptions(params))
        .pipe(map((res: any) => this.onMap(res)));
      this.handleResponse(observer, response);
      this.getAntiforgeryToken();
    });
    return watcher;
  }
  public put<TForm>(
    controller: string,
    action?: string,
    params?: string,
    formData?: TForm,
    host?: string
  ) {
    const url = `${"api"}/${controller}/${action}/${params}`;
    const watcher = new Observable<any>((observer) => {
      const response = this.http
        .put(url, formData, this.createOptions())
        .pipe(map((res: any) => this.onMap(res)));
      this.handleResponse(observer, response);
      this.getAntiforgeryToken();
    });
    return watcher;
  }
  private createOptions = (params?): RequestOptions => {
    const options = new RequestOptions();
    options.withCredentials = true;
    options.params = params;
    if (!options.headers) {
      options.headers = new Headers();
    }
    options.headers.append("X-XSRF-TOKEN", this.antiforgeryToken);

    // if (this.access_token == null) {
    //   this.access_token = this.getBearerToken();
    //   console.log(this.access_token);
    // }
    // options.headers.append('Authorization', 'Bearer ' + this.access_token);

    // options.headers = new Headers({
    //     'Authorization': this.access_token
    // });
    return options;
  };
  private handleResponse(observer: Subscriber<any>, response: Observable<any>) {
    let hasResponse = false;
    const subscription = response.subscribe(
      (data) => {
        hasResponse = true;
        observer.next(data);
      },
      (error) => {
        hasResponse = true;
        observer.error(error);
      },
      () => {
        subscription.unsubscribe();
      }
    );
  }
  private onMap = (res: Response) => {
    try {
      return res.json();
    } catch (ex) {
      try {
        return res.text();
      } catch (ex) {
        return res;
      }
    }
  };
}
