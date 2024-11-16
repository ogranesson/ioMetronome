import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  constructor(private platform: Platform) {}

  isCordova(): boolean {
    return this.platform.is('cordova');
  }

  isCapacitor(): boolean {
    return this.platform.is('capacitor');
  }

  isNative(): boolean {
    return this.isCordova() || this.isCapacitor();
  }

  isBrowser(): boolean {
    return this.platform.is('desktop') || this.platform.is('mobileweb');
  }
}
