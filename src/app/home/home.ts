import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="content">
      <div class="right-side">
        <div class="pill-group">
          <!-- Leaderboards: iterate game modes and show ranked players -->
          <div class="leaderboard-list">
            <div *ngFor="let mode of gameModes" class="leaderboard">
              <h2 style="text-transform: capitalize; margin: 0 0 0.5rem 0">{{ mode }}</h2>

              <div *ngIf="loading()[mode]">
                <p>Loading {{ mode }}...</p>
              </div>

              <div *ngIf="!loading()[mode]">
                <div
                  *ngFor="let player of (leaderboards()[mode] ?? []).slice(0, 5)"
                  class="player-row"
                  style="
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                  "
                >
                  <img
                    [src]="player.avatar"
                    [alt]="player.username"
                    width="40"
                    height="40"
                    style="border-radius: 4px; object-fit: cover"
                  />
                  <div style="flex: 1; min-width: 0">
                    <a
                      [href]="player.url"
                      target="_blank"
                      rel="noopener"
                      style="
                        font-weight: 600;
                        display: block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      "
                      >{{ player.name || player.username }}</a
                    >
                    <div style="font-size: 0.85rem; color: var(--gray-700)">
                      #{{ player.rank }} ·
                      {{
                        player.GameModeCountryCode || (player.country ? '' + player.country : '')
                      }}
                    </div>
                  </div>
                  <div style="text-align: right; min-width: 6rem">
                    <div style="font-weight: 700">{{ player.score }}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-700)">
                      W {{ player.win_count || 0 }} · L {{ player.loss_count || 0 }}
                    </div>
                  </div>
                </div>

                <div *ngIf="(leaderboards()[mode] ?? []).length === 0">
                  <p>No players for {{ mode }}.</p>
                </div>
                <a
                  *ngIf="(leaderboards()[mode] ?? []).length > 5"
                  [routerLink]="['/leaderboard', mode]"
                  class="more-button"
                  style="
                    display: inline-block;
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background-color: var(--gray-400);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--gray-900);
                    text-decoration: none;
                    transition: background-color 0.2s;
                  "
                >
                  More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .content {
        width: 100%;
        max-width: 700px;
        margin-bottom: 3rem;
      }
      .pill-group {
        display: flex;
        flex-direction: column;
        align-items: start;
        flex-wrap: wrap;
        gap: 1.25rem;
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly title = signal('Chess Leaderboard');
  protected readonly expandedModes = signal<Record<string, boolean>>({});

  private readonly http = inject(HttpClient);
  protected readonly apiBase = 'https://8pj62lfkhb.execute-api.us-east-2.amazonaws.com/snapshot';
  protected readonly gameModes = [
    'daily',
    'daily960',
    'tactics',
    'battle',
    'live_blitz',
    'live_blitz960',
    'rush',
    'live_threecheck',
    'live_rapid',
    'live_bullet',
    'live_bughouse',
  ];

  protected readonly leaderboards = signal<Record<string, any[]>>({});
  protected readonly loading = signal<Record<string, boolean>>({});

  constructor() {
    // Initialize expanded states
    for (const mode of this.gameModes) {
      this.expandedModes.update((exp) => ({ ...exp, [mode]: false }));
    }
    // Start fetching data sequentially
    this.fetchAllModes();
  }

  private async fetchAllModes() {
    for (const mode of this.gameModes) {
      await this.fetchMode(mode);
      // Add a small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  private fetchMode(mode: string): Promise<void> {
    return new Promise((resolve) => {
      // mark loading
      this.loading.update((l) => ({ ...l, [mode]: true }));

      const url = `${this.apiBase}?game_mode=${encodeURIComponent(mode)}`;

      this.http.get<any[]>(url).subscribe({
        next: (data) => {
          this.leaderboards.update((lb) => ({ ...lb, [mode]: data }));
          this.loading.update((l) => ({ ...l, [mode]: false }));
          resolve();
        },
        error: (err) => {
          console.error('Failed to fetch leaderboard for', mode, err);
          this.leaderboards.update((lb) => ({ ...lb, [mode]: [] }));
          this.loading.update((l) => ({ ...l, [mode]: false }));
          resolve(); // Still resolve to continue with other modes
        },
      });
    });
  }
}
