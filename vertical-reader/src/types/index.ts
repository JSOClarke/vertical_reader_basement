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
  ankiField?: string;
}
