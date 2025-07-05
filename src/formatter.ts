import chalk from 'chalk';
import { StatsResult, AuthorStats } from './types';

export class Formatter {
  format(stats: StatsResult, format: string = 'table'): string {
    if (format === 'json') {
      return JSON.stringify(stats, null, 2);
    }
    
    return this.formatTable(stats);
  }

  private formatTable(stats: StatsResult): string {
    const output: string[] = [];
    
    // Header
    output.push(chalk.bold.blue('\n📊 Git Statistics Summary'));
    
    if (stats.dateRange.since || stats.dateRange.until) {
      const since = stats.dateRange.since || 'beginning';
      const until = stats.dateRange.until || 'now';
      output.push(chalk.gray(`📅 Date range: ${since} to ${until}`));
    }
    
    output.push(chalk.gray(`📦 Total commits: ${stats.totalCommits}`));
    output.push(chalk.gray(`➕ Total lines added: ${stats.totalLinesAdded}`));
    output.push(chalk.gray(`➖ Total lines deleted: ${stats.totalLinesDeleted}`));
    output.push('');

    if (stats.authorStats.length === 0) {
      output.push(chalk.yellow('No commits found in the specified date range.'));
      return output.join('\n');
    }

    // Table header
    output.push(chalk.bold('👤 Author Statistics:'));
    output.push('');
    
    const headerRow = this.padColumns([
      'Author',
      'Commits',
      'Lines +',
      'Lines -',
      'Net',
      'Files'
    ]);
    
    output.push(chalk.bold.underline(headerRow));
    
    // Author rows
    for (const author of stats.authorStats) {
      const netLines = author.linesAdded - author.linesDeleted;
      const netColor = netLines > 0 ? chalk.green : netLines < 0 ? chalk.red : chalk.gray;
      
      const row = this.padColumns([
        this.truncateString(author.author, 20),
        author.commits.toString(),
        chalk.green(`+${author.linesAdded}`),
        chalk.red(`-${author.linesDeleted}`),
        netColor(netLines > 0 ? `+${netLines}` : netLines.toString()),
        author.filesChanged.toString()
      ]);
      
      output.push(row);
    }
    
    // Summary
    if (stats.authorStats.length > 1) {
      output.push('');
      output.push(chalk.dim('─'.repeat(80)));
      const totalNet = stats.totalLinesAdded - stats.totalLinesDeleted;
      const totalNetColor = totalNet > 0 ? chalk.green : totalNet < 0 ? chalk.red : chalk.gray;
      
      const summaryRow = this.padColumns([
        chalk.bold('TOTAL'),
        chalk.bold(stats.totalCommits.toString()),
        chalk.bold.green(`+${stats.totalLinesAdded}`),
        chalk.bold.red(`-${stats.totalLinesDeleted}`),
        chalk.bold(totalNetColor(totalNet > 0 ? `+${totalNet}` : totalNet.toString())),
        chalk.bold(stats.authorStats.reduce((sum, author) => sum + author.filesChanged, 0).toString())
      ]);
      
      output.push(summaryRow);
    }
    
    output.push('');
    return output.join('\n');
  }

  private padColumns(columns: string[]): string {
    const widths = [25, 8, 10, 10, 10, 8];
    return columns.map((col, i) => {
      const cleanCol = this.stripAnsi(col);
      const padding = Math.max(0, widths[i] - cleanCol.length);
      return col + ' '.repeat(padding);
    }).join('');
  }

  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  private stripAnsi(str: string): string {
    // Simple ANSI escape sequence removal
    return str.replace(/\u001b\[[0-9;]*m/g, '');
  }
}