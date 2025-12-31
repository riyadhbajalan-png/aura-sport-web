
export enum Language {
  ARABIC = 'ar',
  KURDISH = 'ku'
}

export type AppView = 'home' | 'leagues' | 'mercato';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  language: Language;
  category: string;
  date: string;
  league?: string;
  isBreaking?: boolean;
  sourceUrl?: string;
  content?: string;
}

export interface MatchScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time: string;
  isLive: boolean;
}

export interface LeagueStanding {
  rank: number;
  team: string;
  played: number;
  points: number;
  form?: string[];
}

export interface AppState {
  news: NewsItem[];
  scores: MatchScore[];
  loading: boolean;
  error: string | null;
  selectedLanguage: Language | 'all';
  aiSummary: string | null;
  selectedNews: NewsItem | null;
  activeView: AppView; // الحالة الجديدة للتنقل
}
