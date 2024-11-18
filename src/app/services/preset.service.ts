import { Injectable } from '@angular/core';
import { Preset } from '../models/preset.model';
import { Observable, from, Subject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class PresetService {
  private fileName = 'presets.json';
  selectedPreset = new Subject<Preset>();
  private persistentSelectedPreset!: Preset;

  constructor(private platformService: PlatformService) {}

  async loadPresets(): Promise<Preset[]> {
    const defaultPresets: Preset[] = [{ name: 'Default', tempo: 120, beatvolume: 100, beats: 4 }];
    console.log('Loading presets...');

    if (this.platformService.isBrowser()) {
      console.log('Web platform detected, using localStorage.');
      const data = localStorage.getItem(this.fileName);
      if (data) {
        console.log('Data found in localStorage:', data);
        try {
          return JSON.parse(data);
        } catch (error) {
          console.log('Error parsing data from localStorage:', error);
          localStorage.setItem(this.fileName, JSON.stringify(defaultPresets));
          return defaultPresets;
        }
      } else {
        console.log('No data in localStorage, initializing with default presets.');
        localStorage.setItem(this.fileName, JSON.stringify(defaultPresets));
        return defaultPresets;
      }
    } else {
      try {
        const result = await Filesystem.readFile({
          path: this.fileName,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        let content: string;

        if (typeof result.data === 'string') {
          content = result.data;
        } else if (result.data instanceof Blob) {
          content = await result.data.text();
        } else {
          throw new Error('Unexpected data type');
        }

        console.log('File content:', content);
        try {
          const presets = JSON.parse(content) as Preset[];
          console.log('Parsed presets:', presets);
          return presets;
        } catch (error) {
          console.log('Error parsing presets from file:', error);
          await Filesystem.writeFile({
            path: this.fileName,
            data: JSON.stringify(defaultPresets),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
          });
          return defaultPresets;
        }
      } catch (error) {
        console.log('Error reading presets file:', error);
        await Filesystem.writeFile({
          path: this.fileName,
          data: JSON.stringify(defaultPresets),
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        return defaultPresets;
      }
    }
  }

  addPreset(newPreset: Preset): Observable<void> {
    console.log('Adding new preset:', newPreset);

    if (this.platformService.isBrowser()) {
      console.log('Web platform detected, adding preset to localStorage.');
      const data = localStorage.getItem(this.fileName);
      const presets = data ? JSON.parse(data) : [];
      presets.push(newPreset);
      localStorage.setItem(this.fileName, JSON.stringify(presets));
      return from(Promise.resolve());
    } else {
      return from(
        this.loadPresets().then((presets) => {
          presets.push(newPreset);
          console.log('Updated presets:', presets);
          return this.savePresets(presets).toPromise();
        })
      );
    }
  }

  savePresets(presets: Preset[]): Observable<void> {
    console.log('Saving presets:', presets);

    if (this.platformService.isBrowser()) {
      console.log('Web platform detected, saving presets to localStorage.');
      localStorage.setItem(this.fileName, JSON.stringify(presets));
      return from(Promise.resolve());
    } else {
      return from(
        Filesystem.writeFile({
          path: this.fileName,
          data: JSON.stringify(presets),
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        }).then(() => {
          console.log('Presets saved to file:', this.fileName);
        })
      );
    }
  }

  deletePreset(presetName: string): Observable<void> {
    console.log('Deleting preset:', presetName);

    if (this.platformService.isBrowser()) {
      console.log('Web platform detected, deleting preset from localStorage.');
      const data = localStorage.getItem(this.fileName);
      const presets = data ? JSON.parse(data) : [];
      const updatedPresets = presets.filter((p: { name: string }) => p.name !== presetName);
      localStorage.setItem(this.fileName, JSON.stringify(updatedPresets));
      return from(Promise.resolve());
    } else {
      return from(
        this.loadPresets().then((presets) => {
          const updatedPresets = presets.filter((p) => p.name !== presetName);
          console.log('Updated presets after deletion:', updatedPresets);
          return this.savePresets(updatedPresets).toPromise();
        })
      );
    }
  }

  selectPreset(preset: Preset) {
    console.log('Selecting preset:', preset);
    this.selectedPreset.next(preset);
    this.persistentSelectedPreset = preset;
  }

  getPreset(): Preset {
    console.log('Getting selected preset:', this.persistentSelectedPreset);
    return this.persistentSelectedPreset;
  }
}
