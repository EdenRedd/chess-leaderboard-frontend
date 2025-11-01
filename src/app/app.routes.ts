import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LeaderboardDetailsComponent } from './leaderboard-details/leaderboard-details';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'leaderboard/:mode', component: LeaderboardDetailsComponent },
];
