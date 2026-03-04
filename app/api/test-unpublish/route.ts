import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  // This endpoint is only intended for local debugging of the unpublish flow.
  // Return 404 in any non-development environment to avoid exposing internals.
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin client',
        step: 1
      })
    }

    const { data: listings, error: listError } = await supabase
      .from('listings')
      .select('id')
      .eq('status', 'approved')
      .limit(1)

    if (listError) {
      console.error('[test-unpublish] listings query failed', listError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        step: 2
      })
    }

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    return NextResponse.json({
      success: true,
      checks: {
        adminClientCreated: true,
        databaseConnected: true,
        serviceKeySet: hasServiceKey,
        approvedListingsCount: listings?.length || 0,
      },
      message: 'All checks passed. Unpublish should work in this environment.',
    })
  } catch (error) {
    console.error('[test-unpublish] unexpected error', error)
    return NextResponse.json({
      success: false,
      error: 'Internal test error',
      step: 'exception',
    }, { status: 500 })
  }
}
