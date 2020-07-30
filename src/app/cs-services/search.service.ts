import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../app-intefaces';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchText: string = '';
  products: any[] = null;
  searching: boolean = false;
  
  constructor() { }
}
