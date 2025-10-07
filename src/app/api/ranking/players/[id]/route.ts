import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()

    // Obtener el jugador específico
    const { data: player, error } = await supabase
      .from('player_ranking')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }
      console.error('Error fetching player:', error)
      return NextResponse.json(
        { error: 'Error fetching player' },
        { status: 500 }
      )
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
