export interface SentenceProps {
  text: string;
  isActive: boolean;
  isMined?: boolean;
  isBookmarked?: boolean;
  onClick: () => void;
  tapToSelect: boolean;
}

export interface ReaderProps {
  sentences: string[];
  activeIndex: number;
  minedSentences?: Set<string>;
  bookmarks?: number[];
  onIndexChange: (index: number | ((prev: number) => number)) => void;
  tapToSelect: boolean;
  showArrows: boolean;
  centerActive: boolean;
  onOpenJump: () => void;
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

export interface ReaderAesthetics {
  fontSize: number;       // px
  verticalMargin: number; // vh (top/bottom safety zone)
  horizontalMargin: number; // px (gutter between columns)
  readingWidth: number;   // % of viewport (e.g., 50-100)
}

export interface UserProfile {
  sentences: string[];
  activeIndex: number;
  metadata?: BookMetadata;
  ankiField?: string;
  stats?: UserStats;
  bookmarks?: number[];
  aesthetics?: ReaderAesthetics;
  notes?: string;
}
