import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const audience = searchParams.get('audience') // 'parental', 'junior', or null for all

  let query = supabase.from('posts').select('*').eq('status', 'published')

  // Filter by audience if specified
  if (audience) {
    query = query.in('audience', ['all', audience])
  }

  const { data, error } = await query.order('published_at', {
    ascending: false,
  })

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
