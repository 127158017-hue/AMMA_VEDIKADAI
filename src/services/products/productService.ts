/**
 * Product Service
 * Handles product CRUD operations with Firebase
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
  where,
  Query,
  QueryConstraint,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Product } from '@/types';
import { generateId } from '@/utils/generateId';
import { formatErrorMessage } from '@/utils/firebaseErrorHandler';

export class ProductService {
  /**
   * Get all products with optional filters
   */
  static async getAllProducts(
    filters?: {
      category?: string;
      maxPrice?: number;
    }
  ): Promise<Product[]> {
    try {
      let constraints: QueryConstraint[] = [];

      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters?.maxPrice) {
        constraints.push(where('price', '<=', filters.maxPrice));
      }

      const q =
        constraints.length > 0
          ? query(collection(db, 'products'), ...constraints)
          : collection(db, 'products');

      const snapshot = await getDocs(q as Query);
      return snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Product, 'id'>),
        id: doc.id,
      }));
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to load products. Please try again.');
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const snapshot = await getDoc(doc(db, 'products', productId));
      return snapshot.exists()
        ? (snapshot.data() as Product)
        : null;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to load product details. Please try again.');
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const productId = generateId();
      const newProduct: Product = {
        ...product,
        id: productId,
      };

      await setDoc(doc(db, 'products', productId), newProduct);
      return newProduct;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to add product. Please try again.');
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to update product. Please try again.');
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to delete product. Please try again.');
    }
  }

  /**
   * Upload product image to Firebase Storage
   */
  static async uploadProductImage(
    file: File,
    productId: string
  ): Promise<string> {
    try {
      const fileName = `${productId}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `products/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to upload image. Please try again.');
    }
  }

  /**
   * Import products from Excel data
   */
  static async importProductsFromExcel(
    products: Omit<Product, 'id'>[]
  ): Promise<Product[]> {
    try {
      const createdProducts: Product[] = [];

      for (const product of products) {
        const created = await this.createProduct(product);
        createdProducts.push(created);
      }

      return createdProducts;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to import products. Please try again.');
    }
  }

  /**
   * Search products by name
   */
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    } catch (error: any) {
      throw new Error(formatErrorMessage(error) || 'Unable to search products. Please try again.');
    }
  }
}
