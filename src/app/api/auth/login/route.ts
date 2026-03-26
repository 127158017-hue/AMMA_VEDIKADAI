/**
 * Login API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth/authService';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    const user = await AuthService.login(email, password);
    const token = await AuthService.getAuthToken();

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: { user, token },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Login failed',
      },
      { status: 401 }
    );
  }
}
