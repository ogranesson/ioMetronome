import { Injectable } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Preset } from '../models/preset.model';
import { BehaviorSubject, firstValueFrom, from, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PresetService {
  private fileName = 'presets.json';
  selectedPreset = new Subject<Preset>();
  private persistentSelectedPreset!: Preset;

  constructor(private file: File) {}

  private isCordovaAvailable(): boolean {
    return !!(window as any).cordova;
  }

  async loadPresets(): Promise<Preset[]> {
    if (!this.isCordovaAvailable()) {
      console.warn('Cordova is not available. Falling back to localStorage for presets.');
      const data = localStorage.getItem(this.fileName);
      return data ? JSON.parse(data) : [];
    }

    try {
      const path = this.file.dataDirectory;
      const exists = await this.file.checkFile(path, this.fileName);

      if (exists) {
        const content = await this.file.readAsText(path, this.fileName);
        return JSON.parse(content) as Preset[];
      } else {
        const defaultPresets: Preset[] = [
          { name: 'Default', tempo: 120, beatvolume: 100, beats: 4 },
        ];
        await this.file.writeFile(path, this.fileName, JSON.stringify(defaultPresets), { replace: true });
        return defaultPresets;
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      return [];
    }
  }

  addPreset(newPreset: Preset): Observable<void> {
    if (!this.isCordovaAvailable()) {
      console.warn('Cordova is not available. Adding preset to localStorage.');
      const presets = JSON.parse(localStorage.getItem(this.fileName) || '[]') as Preset[];
      presets.push(newPreset);
      localStorage.setItem(this.fileName, JSON.stringify(presets));
      return from(Promise.resolve());
    }

    return from(
      this.loadPresets().then((presets) => {
        presets.push(newPreset);
        return firstValueFrom(this.savePresets(presets));
      })
    );
  }

  savePresets(presets: Preset[]): Observable<void> {
    if (!this.isCordovaAvailable()) {
      console.warn('Cordova is not available. Saving presets to localStorage.');
      localStorage.setItem(this.fileName, JSON.stringify(presets));
      return from(Promise.resolve());
    }

    const path = this.file.dataDirectory;

    return from(
      this.file.writeFile(path, this.fileName, JSON.stringify(presets), { replace: true })
        .then(() => {
          console.log('Presets saved successfully.');
        })
        .catch((err) => {
          console.error('Error writing presets file:', err);
          throw new Error('Failed to save presets');
        })
    );
  }

  deletePreset(presetName: string): Observable<void> {
    if (!this.isCordovaAvailable()) {
      console.warn('Cordova is not available. Deleting preset from localStorage.');
      const presets = JSON.parse(localStorage.getItem(this.fileName) || '[]') as Preset[];
      const updatedPresets = presets.filter((p) => p.name !== presetName);
      localStorage.setItem(this.fileName, JSON.stringify(updatedPresets));
      return from(Promise.resolve());
    }

    return from(
      this.loadPresets().then((presets) => {
        const updatedPresets = presets.filter((p) => p.name !== presetName);
        return firstValueFrom(this.savePresets(updatedPresets));
      })
    );
  }

  selectPreset(preset: Preset) {
    this.selectedPreset.next(preset);
    this.persistentSelectedPreset = preset;
  }

  getPreset(): Preset {
    return this.persistentSelectedPreset;
  }
}
