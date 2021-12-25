import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IListResponseApi } from '../interface/IListResponseApi';
import { IGraphData } from '../interface/IGraphData';

@Injectable({
  providedIn: 'root'
})
export class GraphDataServiceService {

  constructor(private http: HttpClient) { }

  public getAllYear(): Observable<IListResponseApi<string>> {
    return this.get('horizontal-bar/distinct-years');
  }

  public getDataByYear(year: string): Observable<IListResponseApi<IGraphData>> {
    return this.get(`horizontal-bar/data?year=${year}`);
  }

  private get(urlExtenstion: string): Observable<any> {
      const url = urlExtenstion ?  `${environment.serviceUrl}${urlExtenstion}` : `${environment.serviceUrl}`;
      return this.http.get(url, {});
  }
}
