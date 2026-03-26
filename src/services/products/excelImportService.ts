/**
 * Excel Import Service
 * Handles parsing and importing products from Excel files
 */

import * as XLSX from 'xlsx';
import { ExcelProduct, Product } from '@/types';
import { validateProductData } from '@/utils/validation';

export class ExcelImportService {
  /**
   * Parse Excel file and extract product data
   */
  static async parseExcelFile(file: File): Promise<ExcelProduct[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData as ExcelProduct[]);
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Validate and transform Excel data to Product objects
   */
  static validateAndTransformProducts(
    excelData: ExcelProduct[]
  ): {
    products: Omit<Product, 'id'>[];
    errors: { row: number; errors: string[] }[];
  } {
    const products: Omit<Product, 'id'>[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    excelData.forEach((item, index) => {
      const validationErrors = validateProductData(item);

      if (validationErrors.length > 0) {
        errors.push({
          row: index + 2, // Excel row number (1-indexed + header)
          errors: validationErrors,
        });
        return;
      }

      const product: Omit<Product, 'id'> = {
        name: item.name.trim(),
        category: item.category.trim(),
        price: parseFloat(item.price.toString()),
        stock: parseInt(item.stock.toString()),
        description: (item.description || '').trim(),
        imageUrl: (item.image_url || '').trim() || '/images/placeholder.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      products.push(product);
    });

    return { products, errors };
  }

  /**
   * Process entire Excel import workflow
   */
  static async processExcelImport(
    file: File
  ): Promise<{
    success: boolean;
    products: Omit<Product, 'id'>[];
    errors: { row: number; errors: string[] }[];
    totalProcessed: number;
  }> {
    try {
      const excelData = await this.parseExcelFile(file);
      const { products, errors } =
        this.validateAndTransformProducts(excelData);

      return {
        success: errors.length === 0,
        products,
        errors,
        totalProcessed: excelData.length,
      };
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to process Excel import'
      );
    }
  }
}
