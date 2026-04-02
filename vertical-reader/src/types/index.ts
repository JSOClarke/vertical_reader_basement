export interface SentenceProps {
  text: string;
  isActive: boolean;
  onClick: () => void;
  tapToSelect: boolean;
}

export interface ReaderProps {
  sentences: string[];
  activeIndex: number;
  onIndexChange: (index: number | ((prev: number) => number)) => void;
  tapToSelect: boolean;
  showArrows: boolean;
}

export interface BookMetadata {
  title?: string;
  author?: string;
  coverImage?: string;
}

export interface MinedCard {
  bookTitle: string;
  sentence: string;
  timestamp: number;
}

export interface UserStats {
  totalCharactersRead: number;
  readingDays: string[]; // Unique "YYYY-MM-DD" entries
  miningHistory?: MinedCard[];
}

export interface UserProfile {
  sentences: string[];
  activeIndex: number;
  metadata?: BookMetadata;
  ankiField?: string;
  stats?: UserStats;
}
