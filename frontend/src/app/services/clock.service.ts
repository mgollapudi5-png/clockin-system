import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClockResponse } from '../models/clock-log.model';

@Injectable({ providedIn: 'root' })
export class ClockService {

  private readonly apiUrl = `${environment.apiUrl}/clock`;

  constructor(private http: HttpClient) {}

  clockIn(): Observable<ClockResponse> {
    return this.http.post<ClockResponse>(`${this.apiUrl}/in`, {});
  }

  clockOut(): Observable<ClockResponse> {
    return this.http.post<ClockResponse>(`${this.apiUrl}/out`, {});
  }

  getStatus(): Observable<ClockResponse> {
    return this.http.get<ClockResponse>(`${this.apiUrl}/status`);
  }
}
