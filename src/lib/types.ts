export interface Sound {
  id: string;
  fileName: string;
  label: string;
  sortOrder: number;
  url: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  number: string;
  active: boolean;
  photoFile: string | null;
  photoUrl: string | null;
  introFile: string | null;
  introUrl: string | null;
  songFile: string | null;
  songUrl: string | null;
  comboFile: string | null;
  comboUrl: string | null;
  sortOrder: number;
}

export interface LibrarySong {
  id: string;
  title: string;
  artist: string;
  category: string;
  fileName: string;
  url: string;
}

export interface QueueItem {
  url: string;
  name: string;
  label?: string;
  btnId?: string;
}

export interface LiveState {
  gameId: string | null;
  lineup: { player_id: string; batting_order: number }[];
  currentBatterIndex: number;
  currentHalf: string;
  currentInning: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
