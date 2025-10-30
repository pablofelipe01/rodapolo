import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { JuniorProfile } from '@/types/database'

// Add these simple helper functions
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

interface BookingResponse {
  junior_id: string
  status: string
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Get all active junior profiles
    const { data: players, error: playersError } = await supabase
      .from('junior_profiles')
      .select('*')
      .eq('active', true)

    if (playersError) throw playersError
    if (!players?.length) {
      return NextResponse.json({ players: [], stats: null, total: 0 })
    }

    // Get all bookings
    const playerIds = players.map((p: JuniorProfile) => p.id)
    const { data: bookings, error: bookingsError } = await supabase
      .from('simple_bookings_view')
      .select('junior_id, status')
      .in('junior_id', playerIds)

    if (bookingsError) throw bookingsError

    // Group bookings
    const bookingsByPlayer: Record<string, BookingResponse[]> = {}
    bookings?.forEach((booking: BookingResponse) => {
      if (!bookingsByPlayer[booking.junior_id]) {
        bookingsByPlayer[booking.junior_id] = []
      }
      bookingsByPlayer[booking.junior_id].push(booking)
    })

    // Calculate rankings
    const playersWithRankings = players
      .map((player: JuniorProfile) => {
        const playerBookings = bookingsByPlayer[player.id] || []
        const tournaments_played = playerBookings.length
        const tournaments_won = playerBookings.filter(
          (b: BookingResponse) => b.status === 'attended'
        ).length

        return {
          id: player.id,
          player_name: player.full_name,
          unique_code: player.unique_code,
          level: player.level,
          handicap: player.handicap,
          country: 'España',
          tournaments_played,
          tournaments_won,
          ranking_points: calculateRankingPoints(
            tournaments_played,
            tournaments_won,
            player.level
          ),
          stars_juego: calculateStarsJuego(tournaments_won),
          stars_rueda: calculateStarsRueda(tournaments_played),
          created_at: player.created_at,
          updated_at: player.updated_at,
          general_ranking_position: 0,
        }
      })
      .filter(player => player.tournaments_played > 0)
      .sort((a, b) => b.ranking_points - a.ranking_points)
      .map((player, index) => ({
        ...player,
        general_ranking_position: index + 1,
      }))

    // Calculate stats
    const stats = {
      total_players: playersWithRankings.length,
      total_tournaments: playersWithRankings.reduce(
        (sum, p) => sum + p.tournaments_played,
        0
      ),
      average_ranking_points:
        playersWithRankings.length > 0
          ? Math.round(
              playersWithRankings.reduce(
                (sum, p) => sum + p.ranking_points,
                0
              ) / playersWithRankings.length
            )
          : 0,
      top_country: 'España',
      most_active_player:
        playersWithRankings.length > 0
          ? playersWithRankings.reduce((a, b) =>
              a.tournaments_played > b.tournaments_played ? a : b
            ).player_name
          : 'N/A',
    }

    return NextResponse.json({
      players: playersWithRankings,
      stats,
      total: playersWithRankings.length,
    })
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
