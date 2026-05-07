import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId, category, categoryDescription } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class Category {
  // Main category records.
  private categoriesUrl = 'http://localhost:3000/categories';
  // Extra description records linked to categories.
  private categoryDescriptionsUrl = 'http://localhost:3000/categoryDescriptions';

  constructor(private http: HttpClient) {}

  // Used for case-insensitive category comparisons.
  normalizeCategoryName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // Used for case-insensitive description comparisons.
  normalizeDescription(description: string): string {
    return description.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // Finds category by name without caring about casing.
  findCategoryByName(categories: category[], rawName: string): category | undefined {
    const normalizedName = this.normalizeCategoryName(rawName);
    return categories.find((item) => this.normalizeCategoryName(item.categoryName) === normalizedName);
  }

  getCategories(): Observable<category[]> {
    return this.http.get<category[]>(this.categoriesUrl);
  }

  addCategory(newCategory: category): Observable<category> {
    return this.http.post<category>(this.categoriesUrl, newCategory);
  }

  updateCategory(updatedCategory: category): Observable<category> {
    return this.http.put<category>(`${this.categoriesUrl}/${updatedCategory.id}`, updatedCategory);
  }

  // This method expects the full category object so ID is read from it.
  deleteCategory(categoryToDelete: category): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${categoryToDelete.id}`);
  }

  getCategoryDescriptions(): Observable<categoryDescription[]> {
    return this.http.get<categoryDescription[]>(this.categoryDescriptionsUrl);
  }

  getDescriptionsForCategory(categoryId: EntityId): Observable<categoryDescription[]> {
    return this.http.get<categoryDescription[]>(
      `${this.categoryDescriptionsUrl}?categoryId=${encodeURIComponent(String(categoryId))}`
    );
  }

  addCategoryDescription(description: categoryDescription): Observable<categoryDescription> {
    return this.http.post<categoryDescription>(this.categoryDescriptionsUrl, description);
  }

  deleteCategoryDescription(descriptionId: EntityId): Observable<void> {
    return this.http.delete<void>(`${this.categoryDescriptionsUrl}/${descriptionId}`);
  }
}
