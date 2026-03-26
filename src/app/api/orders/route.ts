/**
 * Create Order API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders/orderService';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // TODO: Add user authorization check
    const {
      userId,
      products,
      totalAmount,
      deliveryAddress,
    } = await req.json();

    if (!userId || !products || !totalAmount || !deliveryAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const order = await OrderService.createOrder(
      userId,
      products,
      totalAmount,
      deliveryAddress
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order',
      },
      { status: 400 }
    );
  }
}

/**
 * Get All Orders API Route
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // TODO: Add authorization check
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let orders;
    if (userId) {
      orders = await OrderService.getUserOrders(userId);
    } else {
      orders = await OrderService.getAllOrders();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Orders fetched successfully',
        data: orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
