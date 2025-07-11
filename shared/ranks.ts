export interface RankConfig {
  name: string;
  color: string;
  backgroundColor: string;
  priority: number; // Higher number = higher rank
}

export const RANK_CONFIGS: Record<string, RankConfig> = {
  owner: {
    name: 'OWNER',
    color: '#ffe066',
    backgroundColor: '#553d00',
    priority: 1000
  },
  'co-owner': {
    name: 'CO-OWNER',
    color: '#a745f7',
    backgroundColor: '#632694',
    priority: 900
  },
  developer: {
    name: 'DEVELOPER',
    color: '#8305eb',
    backgroundColor: '#350061',
    priority: 850
  },
  'head-admin': {
    name: 'HEAD-ADMIN',
    color: '#e60000',
    backgroundColor: '#330000',
    priority: 800
  },
  admin: {
    name: 'ADMIN',
    color: '#ffffff',
    backgroundColor: '#e60000',
    priority: 700
  },
  'head-mod': {
    name: 'HEAD-MOD',
    color: '#004488',
    backgroundColor: '#002544',
    priority: 600
  },
  mod: {
    name: 'MOD',
    color: '#0055ff',
    backgroundColor: '#0044cc',
    priority: 500
  },
  member: {
    name: 'MEMBER',
    color: 'white',
    backgroundColor: '#009900',
    priority: 100
  },
  guest: {
    name: 'GUEST',
    color: '#888',
    backgroundColor: '#333',
    priority: 0
  }
};

export const USER_RANKS: Record<string, string> = {
  'Dominus_Elitus': 'owner',
  'meancraft': 'developer',
  'mrbat8888': 'developer',
  'Light slayer': 'head-admin',
  'Ricplays': 'admin',
  'Abyssal.': 'admin',
  'VoidDestroyerXY': 'head-admin'
};

export function getUserRank(username: string): string {
  if (USER_RANKS[username]) {
    return USER_RANKS[username];
  }
  if (username.startsWith('Guest')) {
    return 'guest';
  }
  return 'member';
}

export function getRankConfig(rank: string): RankConfig {
  return RANK_CONFIGS[rank] || RANK_CONFIGS.member;
}

export function isStaffRank(rank: string): boolean {
  const config = getRankConfig(rank);
  return config.priority >= 500; // mod and above
}

export function canModerate(userRank: string, targetRank: string): boolean {
  const userConfig = getRankConfig(userRank);
  const targetConfig = getRankConfig(targetRank);
  return userConfig.priority > targetConfig.priority;
}