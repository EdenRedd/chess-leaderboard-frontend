import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Chess Leaderboard');

  // API base and modes. Adjust `apiBase` or query param key if your backend expects a different name.
  private readonly http = inject(HttpClient);
  protected readonly apiBase = 'https://sp63ictcce.execute-api.us-east-2.amazonaws.com/snapshot';
  protected readonly gameModes = ['daily960', 'daily', 'tactics'];

  // leaderboards: map gameMode -> players[]
  protected readonly leaderboards = signal<Record<string, any[]>>({});
  protected readonly loading = signal<Record<string, boolean>>({});

  constructor() {
    // fetch each mode once on startup
    for (const mode of this.gameModes) {
      this.fetchMode(mode);
    }
  }

  private fetchMode(mode: string) {
    // mark loading
    this.loading.update((l) => ({ ...l, [mode]: true }));

    // NOTE: I'm using the query param name `gamemode`. If your API expects a different key change it here.
    const url = `${this.apiBase}?gamemode=${encodeURIComponent(mode)}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        // the backend already returns ranked lists — store as-is
        this.leaderboards.update((lb) => ({ ...lb, [mode]: data }));
        this.loading.update((l) => ({ ...l, [mode]: false }));
      },
      error: (err) => {
        console.error('Failed to fetch leaderboard for', mode, err);
        this.leaderboards.update((lb) => ({ ...lb, [mode]: [] }));
        this.loading.update((l) => ({ ...l, [mode]: false }));
      },
    });
  }
}
