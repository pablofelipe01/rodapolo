import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Obtener todos los jugadores ordenados por ranking
    const { data: players, error } = await supabase
      .from('player_ranking')
      .select('*')
      .order('general_ranking_position', { ascending: true })

    if (error) {
      console.error('Error fetching players:', error)
      return NextResponse.json(
        { error: 'Error fetching players' },
        { status: 500 }
      )
    }

    // Agregar estadísticas generales
    const { data: stats, error: statsError } =
      await supabase.rpc('get_ranking_stats')

    if (statsError) {
      console.warn('Error fetching stats:', statsError)
      // No es crítico, seguimos sin estadísticas
    }

    return NextResponse.json({
      players: players || [],
      stats: stats || null,
      total: players?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
