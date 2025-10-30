import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { JuniorProfile } from '@/types/database'

// Helper functions
const calculateRankingPoints = (
  played: number,
  won: number,
  level: string
): number => {
  let points = won * 15 + played * 5
  if (level === 'alpha') points += 20
  if (level === 'beta') points += 10
  if (won >= 3) points += 10
  if (won >= 5) points += 15
  return points
}

const calculateStarsJuego = (won: number): number => Math.min(won, 6)
const calculateStarsRueda = (played: number): number =>
  Math.min(Math.floor(played / 2), 6)

interface RouteParams {
  id: string
}

interface BookingResponse {
  status: string
  [key: string]: any
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const params = await context.params
    const { id } = params

    const supabase = await createServerSupabase()

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('junior_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (playerError) {
      if (playerError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }
      throw playerError
    }

    // Add explicit null check and type assertion
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // TypeScript now knows player is not null, but let's be explicit
    const playerData: JuniorProfile = player

    // Get bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('simple_bookings_view')
      .select('*')
      .eq('junior_id', id)
      .order('class_date', { ascending: false })

    if (bookingsError) throw bookingsError

    // Calculate stats
    const tournaments_played = bookings?.length || 0
    const tournaments_won =
      bookings?.filter((b: BookingResponse) => b.status === 'attended')
        .length || 0

    const playerWithStats = {
      id: playerData.id,
      player_name: playerData.full_name,
      unique_code: playerData.unique_code,
      level: playerData.level,
      handicap: playerData.handicap,
      country: 'España',
      tournaments_played,
      tournaments_won,
      ranking_points: calculateRankingPoints(
        tournaments_played,
        tournaments_won,
        playerData.level
      ),
      stars_juego: calculateStarsJuego(tournaments_won),
      stars_rueda: calculateStarsRueda(tournaments_played),
      general_ranking_position: 0,
      bookings: bookings?.slice(0, 10) || [],
      created_at: playerData.created_at,
      updated_at: playerData.updated_at,
    }

    return NextResponse.json({ player: playerWithStats })
  } catch (error: unknown) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
