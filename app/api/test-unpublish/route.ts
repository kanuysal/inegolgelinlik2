import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Test 1: Check if admin client can be created
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin client',
        step: 1
      })
    }

    // Test 2: Check if we can query listings
    const { data: listings, error: listError } = await supabase
      .from('listings')
      .select('id, status, seller_id')
      .eq('status', 'approved')
      .limit(1)

    if (listError) {
      return NextResponse.json({
        success: false,
        error: `Database query failed: ${listError.message}`,
        step: 2
      })
    }

    // Test 3: Check environment variable
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const serviceKeyPreview = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)

    return NextResponse.json({
      success: true,
      checks: {
        adminClientCreated: true,
        databaseConnected: true,
        serviceKeySet: hasServiceKey,
        serviceKeyPreview,
        approvedListingsCount: listings?.length || 0,
        canQueryListings: !listError
      },
      message: 'All checks passed! Unpublish should work.'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      step: 'exception'
    }, { status: 500 })
  }
}
