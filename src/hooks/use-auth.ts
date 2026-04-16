'use client';

import { useCallback, useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface TeamMembership {
  team_id: string;
  team_name: string;
  team_slug: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [activeTeam, setActiveTeamState] = useState<TeamMembership | null>(null);

  const fetchMemberships = useCallback(async (userId: string) => {
    const { data } = await sb
      .from('team_members')
      .select('team_id, role, teams(name, slug)')
      .eq('user_id', userId);

    if (data && data.length > 0) {
      const teams: TeamMembership[] = data.map((m: any) => ({
        team_id: m.team_id,
        team_name: m.teams.name,
        team_slug: m.teams.slug,
        role: m.role,
      }));
      setMemberships(teams);

      // Restore last active team from localStorage, or default to first
      const stored = localStorage.getItem('activeTeamId');
      const restored = teams.find((t) => t.team_id === stored);
      setActiveTeamState(restored || teams[0]);
    } else {
      setMemberships([]);
      setActiveTeamState(null);
    }
  }, []);

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberships(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberships(session.user.id).then(() => setLoading(false));
      } else {
        setMemberships([]);
        setActiveTeamState(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchMemberships]);

  function setActiveTeam(team: TeamMembership) {
    setActiveTeamState(team);
    localStorage.setItem('activeTeamId', team.team_id);
  }

  async function signInWithEmail(email: string) {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }

  async function signInWithGoogle() {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }

  async function signOut() {
    await sb.auth.signOut();
    setUser(null);
    setSession(null);
    setMemberships([]);
    setActiveTeamState(null);
    localStorage.removeItem('activeTeamId');
  }

  return {
    user,
    session,
    loading,
    memberships,
    activeTeam,
    setActiveTeam,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
}
