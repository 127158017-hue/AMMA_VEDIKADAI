/**
 * Upload Product Image API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/products/productService';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // TODO: Add admin authorization check
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file || !productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'File and productId are required',
        },
        { status: 400 }
      );
    }

    const imageUrl = await ProductService.uploadProductImage(file, productId);

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
