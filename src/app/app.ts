import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .main {
        width: 100%;
        min-height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 1rem;
        box-sizing: inherit;
        position: relative;
      }
    `,
  ],
})
export class App {}
