import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { category, categoryDescription, EntityId } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class Category {
  private categoriesUrl = 'http://localhost:3000/categories';
  private categoryDescriptionsUrl = 'http://localhost:3000/categoryDescriptions';
  
  constructor(private http: HttpClient) {}

  normalizeCategoryName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  normalizeDescription(description: string): string {
    return description.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  findCategoryByName(categories: category[], rawName: string): category | undefined {
    const normalizedName = this.normalizeCategoryName(rawName);
    return categories.find((cat) => this.normalizeCategoryName(cat.categoryName) === normalizedName);
  }

  //get all categories
  getCategories(): Observable<category[]> {
    return this.http.get<category[]>(this.categoriesUrl);
  }

  //create new category
  addCategory(category: category): Observable<category> {
    return this.http.post<category>(this.categoriesUrl, category);
  }

  //get all category descriptions
  getCategoryDescriptions(): Observable<categoryDescription[]> {
    return this.http.get<categoryDescription[]>(this.categoryDescriptionsUrl);
  }

  //get descriptions for one category
  getDescriptionsForCategory(categoryId: EntityId): Observable<categoryDescription[]> {
    return this.http.get<categoryDescription[]>(
      `${this.categoryDescriptionsUrl}?categoryId=${encodeURIComponent(String(categoryId))}`
    );
  }

  //create new category description
  addCategoryDescription(description: categoryDescription): Observable<categoryDescription> {
    return this.http.post<categoryDescription>(this.categoryDescriptionsUrl, description);
  }

  //update category
  updateCategory(category: category): Observable<category> {
    const url = `${this.categoriesUrl}/${category.id}`;
    return this.http.put<category>(url, category);
  }

  //delete category
  deleteCategory(category: category): Observable<void> {
    const url = `${this.categoriesUrl}/${category.id}`;
    return this.http.delete<void>(url);
  }

  //delete category description
  deleteCategoryDescription(descriptionId: EntityId): Observable<void> {
    return this.http.delete<void>(`${this.categoryDescriptionsUrl}/${descriptionId}`);
  }
}
