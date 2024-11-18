import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel, IonItem, IonList, IonButton, IonAlert } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AlertController } from '@ionic/angular';
import { Preset } from '../models/preset.model';
import { PresetService } from '../services/preset.service';
import { Subscription } from 'rxjs';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { PlatformService } from '../services/platform.service';


@Component({
  selector: 'app-metronome',
  templateUrl: 'metronome.page.html',
  styleUrls: ['metronome.page.scss'],
  standalone: true,
  imports: [IonAlert, IonButton, IonList, IonItem, IonRange, IonHeader, IonToolbar, IonTitle, IonRange, IonLabel, IonContent, ExploreContainerComponent, FormsModule],
  providers: [NativeAudio]
})
export class MetronomePage {
  rotationAngle: number = 0;
  tempo: number = 60;
  tempoTime: number = 1;
  interval!: ReturnType<typeof setInterval>; // because in Node, setInterval returns a Timeout object, while in the browser it returns a number
  beatvolume: number = 50;
  beats: number = 4;

  presetSubscription!: Subscription;

  isPlaying: boolean = false;
  audio = new Audio('assets/beat.mp3');
  buttonText: string = "Play";

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel'
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: (data: { name: string }) => {
        const newPreset: Preset = {
          name: data.name,
          tempo: this.tempo,
          beatvolume: this.beatvolume,
          beats: this.beats,
        };

        this.presetService.addPreset(newPreset).subscribe({
          next: () => {
            console.log('Preset added successfully');
          },
          error: (err) => {
            console.error('Error adding preset:', err);
          },
        });
      },
    },
  ];

  constructor(private router: Router,
              private alertController: AlertController,
              private presetService: PresetService,
              private nativeAudio: NativeAudio,
              private platformService: PlatformService) { }

  ngOnInit() {
    if (this.platformService.isCordova()) {
      this.nativeAudio.preloadSimple('beat', 'assets/beat.mp3').then(() => {
        console.log('Sound loaded!');
      });
    }

    if (this.platformService.isBrowser()) {
      this.audio.load();
      console.log('Sound loaded!');
    }

    const preset = this.presetService.getPreset();
    if (preset) {
      this.presetService.selectPreset(preset); // Emit the preset for all subscribers
    }

    // Subscribe to the selectedPreset subject and apply the preset
    this.presetSubscription = this.presetService.selectedPreset.subscribe((preset) => {
      if (preset) {
        this.applyPreset(preset);
      }
    });
  }

  applyPreset(preset: Preset) {
    this.tempo = preset.tempo;
    this.beatvolume = preset.beatvolume;
    this.beats = preset.beats;
    this.tempoTime = 60 / preset.tempo;
  }

  ngOnDestroy() {
    if (this.presetSubscription) {
      this.presetSubscription.unsubscribe();
    }
  }

  tempoChange() {
    this.tempoTime = 60/this.tempo;

    if (this.isPlaying) {
      this.metronome();
    }
  }

  metronome() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.rotationAngle == -45) {
        this.rotationAngle = 45;
      }
      else {
        this.rotationAngle = -45;
      }

      setTimeout(() => {
        if (this.rotationAngle === 45 || this.rotationAngle === -45) {
          this.playSound();
        }
      }, (this.tempoTime * 1000) / 3);
    }, this.tempoTime * 1000);
  }

  playSound() {
    if (this.platformService.isBrowser()) { this.audio.currentTime = 0; this.audio.play(); }
    if (this.platformService.isCordova()) { this.nativeAudio.play('beat'); }
  }

  pause() {
    if (this.isPlaying) {
      clearInterval(this.interval);
      this.rotationAngle = 0;
      this.isPlaying = false;
      this.buttonText = "Play";
    }
    else {
      this.metronome();
      this.isPlaying = true;
      this.buttonText = "Pause";
    }
  }

  volume() {
    if (this.platformService.isBrowser()) { this.audio.volume = this.beatvolume / 100; }
    if (this.platformService.isCordova()) {
      this.nativeAudio.setVolumeForComplexAsset('beat', this.beatvolume / 100).then(
        () => console.log('Volume set successfully'),
        (err) => console.error('Error setting volume:', err)
      );
    }
  }
}

