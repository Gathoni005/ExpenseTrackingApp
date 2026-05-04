import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { category} from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class Category {
  private apiUrl = 'http://localhost:3000/categories';
  
  constructor(private http: HttpClient) {}
   //get all categories
  getCategories(): Observable<category[]> {
    return this.http.get<category[]>(this.apiUrl);
  }
   //create new category
  addCategory(category: category): Observable<category> {
    return this.http.post<category>(this.apiUrl, category);
  }
   //update category
  updateCategory(category: category): Observable<category> {
    const url = `${this.apiUrl}/${category.id}`;
    return this.http.put<category>(url, category);
  }
    //delete category
  deleteCategory(category: category): Observable<void> {
    const url = `${this.apiUrl}/${category.id}`;
    return this.http.delete<void>(url);
  }
}
