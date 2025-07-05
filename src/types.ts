export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: Date;
  message: string;
  filesChanged: FileChange[];
}

export interface FileChange {
  file: string;
  added: number;
  deleted: number;
}

export interface AuthorStats {
  author: string;
  email: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
}

export interface GitStatsOptions {
  since?: string;
  until?: string;
  author?: string;
  merges?: boolean;
}

export interface StatsResult {
  authorStats: AuthorStats[];
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  dateRange: {
    since?: string;
    until?: string;
  };
}