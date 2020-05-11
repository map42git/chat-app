import { Injectable } from "@angular/core";
import { Http, RequestOptions, Headers } from "@angular/http";
import { HttpRequest, HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subscriber } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  apiHost: String = "http://videoui.upstart42.com/api";
  httpOptions = {
    headers: new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
    }),
  };
  antiforgeryToken: string;
  accessToken: string;
  constructor(private http: Http, private httpClient: HttpClient) {}
  public getAntiforgeryToken<TViewModel>() {
    this.get("token").subscribe(
      (success) => {
        this.antiforgeryToken = success.token;
      },
      (error) => {}
    );
  }
  encodeQueryData(data) {
    const ret = [];
    for (let d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
  }
  public get<TViewModel>(
    controller: string,
    action: string = "",
    params?: {},
    host?: string,
    needAntiforgery?: boolean
  ) {
    const url = `${this.apiHost}/${controller}/${action}`;
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
    const url = `${this.apiHost}/${controller}/${action}`;
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
    const url = `${this.apiHost}/${controller}/${action}`;
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
    const url = `${this.apiHost}/${controller}/${action}/${params}`;
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
    options.withCredentials = false;
    options.params = params;
    if (!options.headers) {
      options.headers = new Headers();
    }
    options.headers.append("X-XSRF-TOKEN", this.antiforgeryToken);

    if (this.accessToken != null) {
      options.headers.append("Authorization", `Bearer ${this.accessToken}`);
    }
    // options.headers.append('Authorization', 'Bearer ' + this.access_token);

    // options.headers = new Headers({
    //     'Authorization': this.access_token
    // });
    return options;
  };
  getAccessToken() {
    return new Promise<string>((resolve) => {
      const params = {
        sid: "ubeiEgoNahui",
        apikey: "ebat'blyad",
        apisecret: "igorSaysBrulurur",
      };
      this.get("auth", "token", params).subscribe((accessToken) => {
        this.accessToken = accessToken.token;
        resolve();
      });
    });
  }
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
