/**
 * Category Service
 * Handles category CRUD operations with Firebase
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  Query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateId } from '@/utils/generateId';
import { formatErrorMessage } from '@/utils/firebaseErrorHandler';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryService {
  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, 'categories'));
      const snapshot = await getDocs(q as Query);
      return snapshot.docs
        .map((doc) => ({
          ...(doc.data() as Omit<Category, 'id'>),
          id: doc.id,
        }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to load categories. Please try again.');
    }
  }

  /**
   * Get a single category by ID
   */
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const snapshot = await getDoc(doc(db, 'categories', categoryId));
      return snapshot.exists()
        ? ({
            ...(snapshot.data() as Omit<Category, 'id'>),
            id: snapshot.id,
          } as Category)
        : null;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to load category. Please try again.')
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(
    name: string,
    description?: string
  ): Promise<Category> {
    try {
      const categoryId = generateId();
      const newCategory: Category = {
        id: categoryId,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'categories', categoryId), newCategory);
      return newCategory;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to add category. Please try again.');
    }
  }

  /**
   * Update an existing category
   */
  static async updateCategory(
    categoryId: string,
    updates: Partial<Omit<Category, 'id'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'categories', categoryId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to update category. Please try again.');
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to delete category. Please try again.');
    }
  }
}
