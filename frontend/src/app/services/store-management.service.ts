import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoreDTO, CreateStoreRequest } from '../models/store.model';
import { StoreAuthService } from './store-auth.service';

@Injectable({ providedIn: 'root' })
export class StoreManagementService {

  private readonly apiUrl = `${environment.apiUrl}/creator`;

  constructor(private http: HttpClient, private storeAuthService: StoreAuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.storeAuthService.getCreatorToken()}` });
  }

  getAllStores(): Observable<StoreDTO[]> {
    return this.http.get<StoreDTO[]>(`${this.apiUrl}/stores`, { headers: this.headers() });
  }

  createStore(request: CreateStoreRequest): Observable<StoreDTO> {
    return this.http.post<StoreDTO>(`${this.apiUrl}/stores`, request, { headers: this.headers() });
  }

  resetSessions(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/stores/${id}/reset-sessions`, {}, { headers: this.headers() });
  }

  changeDeviceLimit(id: number, limit: number): Observable<StoreDTO> {
    return this.http.post<StoreDTO>(`${this.apiUrl}/stores/${id}/device-limit`, { limit }, { headers: this.headers() });
  }

  toggleActive(id: number): Observable<StoreDTO> {
    return this.http.post<StoreDTO>(`${this.apiUrl}/stores/${id}/toggle-active`, {}, { headers: this.headers() });
  }

  promoteToCreator(id: number): Observable<StoreDTO> {
    return this.http.post<StoreDTO>(`${this.apiUrl}/stores/${id}/promote`, {}, { headers: this.headers() });
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/stores/${id}/change-password`, { password }, { headers: this.headers() });
  }
}
