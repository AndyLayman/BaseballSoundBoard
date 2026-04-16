'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sb } from '@/lib/supabase';
import type { LiveState, Player } from '@/lib/types';

const INITIAL_STATE: LiveState = {
  gameId: null,
  lineup: [],
  currentBatterIndex: 0,
  currentHalf: 'top',
  currentInning: 1,
};

export function useLiveGame(players: Player[]) {
  const [liveState, setLiveState] = useState<LiveState>(INITIAL_STATE);
  const channelRef = useRef<ReturnType<typeof sb.channel> | null>(null);
  const lastSyncRef = useRef(0);

  const initLiveSync = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastSyncRef.current < 10000) return;
      lastSyncRef.current = now;

      try {
        let gameId: string | null = null;

        const { data: activeGames } = await sb
          .from('games')
          .select('id')
          .eq('status', 'in_progress')
          .limit(1);

        if (activeGames && activeGames.length > 0) {
          gameId = activeGames[0].id;
        } else {
          const { data: gs } = await sb
            .from('game_state')
            .select('game_id, updated_at')
            .order('updated_at', { ascending: false })
            .limit(1);
          if (gs && gs.length > 0) {
            const age = Date.now() - new Date(gs[0].updated_at).getTime();
            if (age <= 12 * 60 * 60 * 1000) {
              gameId = gs[0].game_id;
            }
          }
        }

        if (!gameId) {
          if (channelRef.current) {
            sb.removeChannel(channelRef.current);
            channelRef.current = null;
          }
          setLiveState(INITIAL_STATE);
          return [];
        }

        const { data: stateRow } = await sb
          .from('game_state')
          .select('current_batter_index, current_half, current_inning')
          .eq('game_id', gameId)
          .single();

        const { data: lineup } = await sb
          .from('game_lineup')
          .select('player_id, batting_order')
          .eq('game_id', gameId)
          .order('batting_order');

        const newState: LiveState = {
          gameId,
          lineup: lineup || [],
          currentBatterIndex: stateRow?.current_batter_index ?? 0,
          currentHalf: stateRow?.current_half ?? 'top',
          currentInning: stateRow?.current_inning ?? 1,
        };

        setLiveState(newState);

        // Subscribe to realtime changes
        if (!channelRef.current) {
          channelRef.current = sb
            .channel(`sound-sync-${gameId}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'game_state',
                filter: `game_id=eq.${gameId}`,
              },
              (payload) => {
                const row = payload.new as any;
                setLiveState((prev) => ({
                  ...prev,
                  currentBatterIndex: row.current_batter_index,
                  currentHalf: row.current_half,
                  currentInning: row.current_inning,
                }));
              }
            )
            .subscribe();
        }

        // Return sorted player IDs for reordering
        if (newState.lineup.length > 0) {
          const lineupOrder = new Map(
            newState.lineup.map((e, i) => [e.player_id, i])
          );
          return [...players].sort((a, b) => {
            const aIn = lineupOrder.has(a.id);
            const bIn = lineupOrder.has(b.id);
            if (aIn && bIn) return lineupOrder.get(a.id)! - lineupOrder.get(b.id)!;
            if (aIn) return -1;
            if (bIn) return 1;
            return 0;
          });
        }

        return null;
      } catch (err) {
        console.error('Live sync init failed:', err);
        return null;
      }
    },
    [players]
  );

  useEffect(() => {
    initLiveSync(true);

    const handler = () => {
      if (document.visibilityState === 'visible') initLiveSync();
    };
    document.addEventListener('visibilitychange', handler);

    const interval = setInterval(() => {
      if (!liveState.gameId) initLiveSync();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handler);
      clearInterval(interval);
      if (channelRef.current) {
        sb.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [initLiveSync, liveState.gameId]);

  return { liveState, initLiveSync };
}
