import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leaderboard-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-details">
      <h2 style="text-transform: capitalize; margin: 0 0 1rem 0">{{ gameMode() }}</h2>

      <div *ngIf="loading()">
        <p>Loading {{ gameMode() }}...</p>
      </div>

      <div *ngIf="!loading()">
        <div
          *ngFor="let player of players()"
          class="player-row"
          style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
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
              {{ player.GameModeCountryCode || (player.country ? '' + player.country : '') }}
            </div>
          </div>
          <div style="text-align: right; min-width: 6rem">
            <div style="font-weight: 700">{{ player.score }}</div>
            <div style="font-size: 0.8rem; color: var(--gray-700)">
              W {{ player.win_count || 0 }} · L {{ player.loss_count || 0 }}
            </div>
          </div>
        </div>

        <div *ngIf="players().length === 0">
          <p>No players for {{ gameMode() }}.</p>
        </div>

        <button
          (click)="goBack()"
          style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: var(--gray-400);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--gray-900);
          "
        >
          Back to Overview
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .leaderboard-details {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
    `,
  ],
})
export class LeaderboardDetailsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  protected readonly apiBase = 'https://8pj62lfkhb.execute-api.us-east-2.amazonaws.com/snapshot';

  protected readonly gameMode = signal<string>('');
  protected readonly players = signal<any[]>([]);
  protected readonly loading = signal<boolean>(true);

  ngOnInit() {
    // Get the game mode from the URL parameter
    this.route.params.subscribe((params) => {
      const mode = params['mode'];
      this.gameMode.set(mode);
      this.fetchLeaderboard(mode);
    });
  }

  private fetchLeaderboard(mode: string) {
    this.loading.set(true);
    const url = `${this.apiBase}?game_mode=${encodeURIComponent(mode)}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.players.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch leaderboard:', err);
        this.players.set([]);
        this.loading.set(false);
      },
    });
  }

  protected goBack() {
    window.history.back();
  }
}
