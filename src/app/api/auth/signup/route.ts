/**
 * Signup API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth/authService';
import { ApiResponse } from '@/types';
import { validateEmail, validatePassword } from '@/utils/validation';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        },
        { status: 400 }
      );
    }

    const user = await AuthService.signup(email, password, name);

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
        data: { user },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Signup failed',
      },
      { status: 400 }
    );
  }
}
