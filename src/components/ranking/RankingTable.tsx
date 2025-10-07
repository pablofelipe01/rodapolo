'use client'

import { useState, useEffect } from 'react'
import { PlayerRanking } from '@/types/database'

interface RankingTableProps {
  className?: string
}

interface RankingStats {
  total_players: number
  total_tournaments: number
  average_ranking_points: number
  top_country: string
  most_active_player: string
}

interface RankingResponse {
  players: PlayerRanking[]
  stats: RankingStats | null
  total: number
}

export default function RankingTable({ className = '' }: RankingTableProps) {
  const [data, setData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRanking | null>(
    null
  )

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/ranking/players')

        if (!response.ok) {
          throw new Error('Error fetching ranking data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      España: '🇪🇸',
      Argentina: '🇦🇷',
      'Reino Unido': '🇬🇧',
      Marruecos: '🇲🇦',
    }
    return flags[country] || '🏳️'
  }

  const getRankingColor = (position: number) => {
    if (position === 1) return 'text-yellow-600 font-bold'
    if (position === 2) return 'text-gray-500 font-bold'
    if (position === 3) return 'text-orange-600 font-bold'
    if (position <= 10) return 'text-blue-600'
    return 'text-gray-700'
  }

  const renderStars = (stars: number, type: 'juego' | 'rueda') => {
    const maxStars = type === 'juego' ? 6 : 6
    return (
      <div className='flex items-center gap-1'>
        {Array.from({ length: maxStars }, (_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < stars ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
        <span className='ml-1 text-xs text-gray-600'>
          {stars}/{maxStars}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 rounded mb-4'></div>
          <div className='space-y-3'>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='text-red-800 font-semibold'>Error</h3>
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    )
  }

  if (!data || !data.players.length) {
    return (
      <div className={`p-6 ${className}`}>
        <div className='text-center py-8'>
          <h3 className='text-gray-600 text-lg'>
            No hay datos de ranking disponibles
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Estadísticas generales */}
      {data.stats && (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-blue-50 p-3 rounded-lg text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {data.stats.total_players}
            </div>
            <div className='text-sm text-blue-800'>Jugadores</div>
          </div>
          <div className='bg-green-50 p-3 rounded-lg text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {data.stats.total_tournaments}
            </div>
            <div className='text-sm text-green-800'>Torneos</div>
          </div>
          <div className='bg-purple-50 p-3 rounded-lg text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {Math.round(data.stats.average_ranking_points)}
            </div>
            <div className='text-sm text-purple-800'>Puntos Promedio</div>
          </div>
          <div className='bg-orange-50 p-3 rounded-lg text-center'>
            <div className='text-xl font-bold text-orange-600'>
              {getCountryFlag(data.stats.top_country)}
            </div>
            <div className='text-sm text-orange-800'>País Líder</div>
          </div>
          <div className='bg-red-50 p-3 rounded-lg text-center'>
            <div className='text-sm font-bold text-red-600 truncate'>
              {data.stats.most_active_player?.split(' ')[0]}
            </div>
            <div className='text-xs text-red-800'>Más Activo</div>
          </div>
        </div>
      )}

      {/* Tabla de ranking */}
      <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Pos
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Jugador
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  País
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ⭐ Juego
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ⭐ Rueda
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Torneos
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Puntos
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {data.players.map(player => (
                <tr key={player.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <span
                      className={`text-lg font-bold ${getRankingColor(player.general_ranking_position)}`}
                    >
                      #{player.general_ranking_position}
                    </span>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {player.player_name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {player.country}
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <span className='text-xl mr-2'>
                        {getCountryFlag(player.country)}
                      </span>
                      <span className='text-sm text-gray-900'>
                        {player.country}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    {renderStars(player.stars_juego, 'juego')}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    {renderStars(player.stars_rueda, 'rueda')}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {player.tournaments_won} / {player.tournaments_played}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {player.tournaments_played > 0
                        ? `${Math.round((player.tournaments_won / player.tournaments_played) * 100)}% éxito`
                        : 'Sin datos'}
                    </div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <span className='text-lg font-semibold text-blue-600'>
                      {player.ranking_points}
                    </span>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles del jugador */}
      {selectedPlayer && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Detalles del Jugador
                </h2>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ✕
                </button>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='text-4xl'>
                    {getCountryFlag(selectedPlayer.country)}
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>
                      {selectedPlayer.player_name}
                    </h3>
                    <p className='text-gray-600'>
                      Posición: #{selectedPlayer.general_ranking_position}
                    </p>
                    <p className='text-gray-600'>{selectedPlayer.country}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-semibold mb-2'>Ranking General</h4>
                    <div
                      className={`text-3xl font-bold ${getRankingColor(selectedPlayer.general_ranking_position)}`}
                    >
                      #{selectedPlayer.general_ranking_position}
                    </div>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-semibold mb-2'>Puntos de Ranking</h4>
                    <div className='text-3xl font-bold text-blue-600'>
                      {selectedPlayer.ranking_points}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-semibold mb-2'>Estrellas de Juego</h4>
                    {renderStars(selectedPlayer.stars_juego, 'juego')}
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-semibold mb-2'>Estrellas de Rueda</h4>
                    {renderStars(selectedPlayer.stars_rueda, 'rueda')}
                  </div>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h4 className='font-semibold mb-2'>
                    Estadísticas de Torneos
                  </h4>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-2xl font-bold text-green-600'>
                        {selectedPlayer.tournaments_played}
                      </div>
                      <div className='text-sm text-gray-600'>Jugados</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-yellow-600'>
                        {selectedPlayer.tournaments_won}
                      </div>
                      <div className='text-sm text-gray-600'>Ganados</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-blue-600'>
                        {selectedPlayer.tournaments_played > 0
                          ? `${Math.round((selectedPlayer.tournaments_won / selectedPlayer.tournaments_played) * 100)}%`
                          : '0%'}
                      </div>
                      <div className='text-sm text-gray-600'>Éxito</div>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h4 className='font-semibold mb-2'>Última Actualización</h4>
                  <p className='text-sm text-gray-600'>
                    {new Date(selectedPlayer.updated_at).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className='mt-6 flex justify-end'>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
