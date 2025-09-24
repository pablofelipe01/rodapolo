import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, content, published, audience } = body

  const insertData = {
    title,
    content,
    audience: audience || 'all',
    status: published ? 'published' : 'draft',
    published_at: published ? new Date().toISOString() : null,
    // created_by will be null for now since we don't have authentication
  }

  console.log('Inserting post data:', insertData)

  const { data, error } = await supabase
    .from('posts')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
