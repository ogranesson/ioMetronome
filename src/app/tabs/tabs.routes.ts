import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'metronome',
        loadComponent: () =>
          import('../metronome/metronome.page').then((m) => m.MetronomePage),
      },
      {
        path: 'presets',
        loadComponent: () =>
          import('../presets/presets.page').then((m) => m.PresetsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/presets',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/presets',
    pathMatch: 'full',
  },
];
