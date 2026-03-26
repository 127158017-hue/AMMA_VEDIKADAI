/**
 * Get All Products API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/products/productService';
import { ApiResponse } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;

    const products = await ProductService.getAllProducts({
      category: category,
      maxPrice: maxPrice,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Products fetched successfully',
        data: products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}

/**
 * Create New Product API Route
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // TODO: Add admin authorization check
    const productData = await req.json();

    const product = await ProductService.createProduct(productData);

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create product',
      },
      { status: 400 }
    );
  }
}
