import { execSync } from 'child_process';
import { GitCommit, GitStatsOptions, FileChange } from './types';

export class GitAnalyzer {
  async getCommits(options: GitStatsOptions): Promise<GitCommit[]> {
    try {
      // Build git log command
      let gitLogCmd = 'git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --numstat';
      
      if (options.since) {
        gitLogCmd += ` --since="${options.since}"`;
      }
      
      if (options.until) {
        gitLogCmd += ` --until="${options.until}"`;
      }
      
      if (options.author) {
        gitLogCmd += ` --author="${options.author}"`;
      }
      
      if (!options.merges) {
        gitLogCmd += ' --no-merges';
      }

      const output = execSync(gitLogCmd, { encoding: 'utf8', cwd: process.cwd() });
      
      return this.parseGitLog(output);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not a git repository')) {
        throw new Error('Current directory is not a git repository');
      }
      throw new Error(`Failed to get git commits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGitLog(output: string): GitCommit[] {
    const commits: GitCommit[] = [];
    const lines = output.trim().split('\n');
    
    let currentCommit: Partial<GitCommit> | null = null;
    
    for (const line of lines) {
      if (line.includes('|') && line.split('|').length === 5) {
        // This is a commit header line
        if (currentCommit) {
          commits.push(currentCommit as GitCommit);
        }
        
        const [hash, author, email, dateStr, message] = line.split('|');
        currentCommit = {
          hash,
          author,
          email,
          date: new Date(dateStr),
          message,
          filesChanged: []
        };
      } else if (currentCommit && line.trim()) {
        // This is a file stats line (added, deleted, filename)
        const parts = line.trim().split('\t');
        if (parts.length === 3) {
          const [addedStr, deletedStr, file] = parts;
          const added = addedStr === '-' ? 0 : parseInt(addedStr, 10);
          const deleted = deletedStr === '-' ? 0 : parseInt(deletedStr, 10);
          
          currentCommit.filesChanged!.push({
            file,
            added: isNaN(added) ? 0 : added,
            deleted: isNaN(deleted) ? 0 : deleted
          });
        }
      }
    }
    
    // Don't forget the last commit
    if (currentCommit) {
      commits.push(currentCommit as GitCommit);
    }
    
    return commits;
  }

  async isGitRepository(): Promise<boolean> {
    try {
      execSync('git rev-parse --is-inside-work-tree', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd() 
      });
      return true;
    } catch {
      return false;
    }
  }
}