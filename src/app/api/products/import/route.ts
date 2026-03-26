/**
 * Excel Import API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { ExcelImportService } from '@/services/products/excelImportService';
import { ProductService } from '@/services/products/productService';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // TODO: Add admin authorization check
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Excel file is required',
        },
        { status: 400 }
      );
    }

    // Process Excel import
    const { products, errors, totalProcessed } =
      await ExcelImportService.processExcelImport(file);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some rows have validation errors',
          data: {
            totalProcessed,
            errors,
            productsProcessed: products.length,
          },
        },
        { status: 400 }
      );
    }

    // Import products to database
    const importedProducts =
      await ProductService.importProductsFromExcel(products);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${importedProducts.length} products`,
        data: {
          totalProcessed,
          imported: importedProducts.length,
          products: importedProducts,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Excel import failed',
      },
      { status: 500 }
    );
  }
}
