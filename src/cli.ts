#!/usr/bin/env node

import { Command } from 'commander';
import { GitAnalyzer } from './git-analyzer';
import { StatsCalculator } from './stats-calculator';
import { Formatter } from './formatter';

const program = new Command();

program
  .name('git-stats')
  .description('Analyze git commit statistics by author and date range')
  .version('1.0.0')
  .option('-s, --since <date>', 'Show commits since date (YYYY-MM-DD or relative like "1 week ago")')
  .option('-u, --until <date>', 'Show commits until date (YYYY-MM-DD or relative like "yesterday")')
  .option('-a, --author <pattern>', 'Filter commits by author name/email pattern')
  .option('--no-merges', 'Exclude merge commits', false)
  .option('--format <type>', 'Output format (table|json)', 'table')
  .parse();

async function main() {
  try {
    const options = program.opts();
    
    // Default to today if no date range specified
    if (!options.since && !options.until) {
      const today = new Date().toISOString().split('T')[0];
      options.since = today;
    }

    const gitAnalyzer = new GitAnalyzer();
    const commits = await gitAnalyzer.getCommits(options);
    
    const statsCalculator = new StatsCalculator();
    const stats = await statsCalculator.calculateStats(commits);
    
    const formatter = new Formatter();
    const output = formatter.format(stats, options.format);
    
    console.log(output);
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();