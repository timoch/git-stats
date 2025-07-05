import { GitCommit, AuthorStats, StatsResult } from './types';

export class StatsCalculator {
  async calculateStats(commits: GitCommit[]): Promise<StatsResult> {
    const authorMap = new Map<string, AuthorStats>();
    let totalCommits = 0;
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;

    for (const commit of commits) {
      totalCommits++;
      
      // Use email as unique identifier for authors
      const authorKey = commit.email;
      
      if (!authorMap.has(authorKey)) {
        authorMap.set(authorKey, {
          author: commit.author,
          email: commit.email,
          commits: 0,
          linesAdded: 0,
          linesDeleted: 0,
          filesChanged: 0
        });
      }
      
      const authorStats = authorMap.get(authorKey)!;
      authorStats.commits++;
      
      // Calculate file changes for this commit
      const uniqueFiles = new Set<string>();
      let commitLinesAdded = 0;
      let commitLinesDeleted = 0;
      
      for (const fileChange of commit.filesChanged) {
        uniqueFiles.add(fileChange.file);
        commitLinesAdded += fileChange.added;
        commitLinesDeleted += fileChange.deleted;
      }
      
      authorStats.linesAdded += commitLinesAdded;
      authorStats.linesDeleted += commitLinesDeleted;
      authorStats.filesChanged += uniqueFiles.size;
      
      totalLinesAdded += commitLinesAdded;
      totalLinesDeleted += commitLinesDeleted;
    }

    // Sort authors by total lines changed (added + deleted)
    const authorStats = Array.from(authorMap.values()).sort((a, b) => {
      const totalA = a.linesAdded + a.linesDeleted;
      const totalB = b.linesAdded + b.linesDeleted;
      return totalB - totalA;
    });

    return {
      authorStats,
      totalCommits,
      totalLinesAdded,
      totalLinesDeleted,
      dateRange: {
        since: this.getDateRange(commits, 'earliest'),
        until: this.getDateRange(commits, 'latest')
      }
    };
  }

  private getDateRange(commits: GitCommit[], type: 'earliest' | 'latest'): string | undefined {
    if (commits.length === 0) return undefined;
    
    const dates = commits.map(c => c.date);
    const targetDate = type === 'earliest' 
      ? new Date(Math.min(...dates.map(d => d.getTime())))
      : new Date(Math.max(...dates.map(d => d.getTime())));
    
    return targetDate.toISOString().split('T')[0];
  }
}