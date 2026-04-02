export interface SentenceProps {
  text: string;
  isActive: boolean;
  onClick: () => void;
}

export interface ReaderProps {
  sentences: string[];
  activeIndex: number;
  onIndexChange: (index: number | ((prev: number) => number)) => void;
}

export interface BookMetadata {
  title?: string;
  author?: string;
  coverImage?: string;
}

export interface UserProfile {
  sentences: string[];
  activeIndex: number;
  metadata?: BookMetadata;
}
