import { Injectable, Inject, ErrorHandler } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { ROUTES } from "../contracts/routes.contract";
import { CONFIG } from "../contracts/config.contract";

@Injectable()
export class ApiService {

  private headers: any = {};
  private body: any = {};
  private query: any = {};
  private options: any = {};

  constructor(
    private http: Http,
    @Inject(ROUTES) private routes,
    @Inject(CONFIG) private config
  ) {

    if(this.config.headers) {
      for(let header in this.config.headers) {
        if(Object.prototype.hasOwnProperty.call(this.config.headers, header)) {
          this.headers[header] = this.config.headers[header];
        }
      }
    }

    if(this.config.body) {
      for(let param in this.config.body) {
        if(Object.prototype.hasOwnProperty.call(this.config.body, param)) {
          this.body[param] = this.config.body[param];
        }
      }
    }

    if(this.config.query) {
      for(let param in this.config.query) {
        if(Object.prototype.hasOwnProperty.call(this.config.query, param)) {
          this.query[param] = this.config.query[param];
        }
      }
    }
  }

  addDefaultHeader(header: string, value: string) {
    this.headers[header] = value;
  }

  addDefaultBodyParameter(key: string, value: string) {
    this.body[key] = value;
  }

  addDefaultQueryParameter(key: string, value: string) {
    this.query[key] = value;
  }

  replaceQuery(url: string, params = {}): string {
    for(let param in params) {
      if(params[param]) {
        param = param.replace(/\$/g, '$$$$');
        let replace = `{${param}}`;
        url = url.replace(new RegExp(replace), params[param]);
      }
    }
    return url;
  }

  appendQuery(url: string, params = {}): string {   
    let paramString:string[] = [];
    for(let param in params) {
      //only replace if it's not defined.
      if(url.indexOf(param) == -1) {
        paramString.push(param + '=' + params[param]); 
      }
    }
    if(paramString.length) {
      let params = (url.indexOf('?') > -1) ? '&' + paramString.join('&') : '?' + paramString.join('&');
      return url + params;
    }
    else {
      return url;
    }
  }

  appendHeaders(headers: Headers, values: any) {
    for(let name in values) {
      if(Object.prototype.hasOwnProperty.call(values, name)) {
        headers.append(name, values[name]);
      }
    }

    return headers;
  }

  appendBody(body: URLSearchParams, values: any) {
    for(let name in values) {
      if(values[name] instanceof Array) {
        for(let sub in values[name]) {
          body.append(name+'[]', values[name][sub]);
        }
      }
      else {
        body.append(name, values[name]);
      }
    }

    return body;
  }

  isExternal(url: string): boolean {
    return (/^(f|ht)tps?:\/\//i.test(url)) ? true : false;
  }

  get(route: string, params = {}, external?: boolean): Observable<any> {
    
    let mergedParams = Object.assign({}, this.query, params);
    let url = this.routes[route];
    //first replace all variable parameters in the route
    url = this.replaceQuery(url, mergedParams);
    //append any left over variables
    url = this.appendQuery(url, mergedParams);

    console.log('getting from api', url);

    const requestUrl = (this.isExternal(url)) ? url : this.config.baseUrl + url;

    console.log('here');

    return this.http.get(requestUrl)
           .timeout(this.config.timeout)
           .retry(this.config.retry || 0)
           .map(data => data.json());
  }

  post(route: string, params, passHeaders?): Observable<any> {
    if(this.routes[route] === undefined) { throw new Error('API: Route not found'); }
    if(route.split('.')[0] !== 'post') { throw new Error('API: Method not allowed'); }
    let url = this.routes[route];

    let mergedParams = Object.assign({}, this.query, params);
    url = this.replaceQuery(url, mergedParams);

    let body = new URLSearchParams();
    let options = new RequestOptions();
    let headers = new Headers();


    const mergedHeaders = Object.assign({}, this.headers, passHeaders);
    headers = this.appendHeaders(headers, mergedHeaders);
    options.headers = headers;
    
    const mergedBody = Object.assign({}, this.body, params);
    body = this.appendBody(body, mergedBody);

    console.log('body', body);

    

    const requestUrl = (this.isExternal(url)) ? url : this.config.baseUrl + url;

    return this.http.post(requestUrl, body, options)
           .timeout(this.config.timeout)
           .retry(this.config.retry || 0)
           .map(data => data.json());

  }

}
