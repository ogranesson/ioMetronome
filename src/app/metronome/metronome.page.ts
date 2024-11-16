import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel, IonItem, IonList, IonButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AlertController } from '@ionic/angular';
import { Preset } from '../models/preset.model';
import { PresetService } from '../services/preset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-metronome',
  templateUrl: 'metronome.page.html',
  styleUrls: ['metronome.page.scss'],
  standalone: true,
  imports: [IonButton, IonList, IonItem, IonRange, IonHeader, IonToolbar, IonTitle, IonRange, IonLabel, IonContent, ExploreContainerComponent, FormsModule],
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

  constructor(private router: Router, private alertController: AlertController, private presetService: PresetService) {}

  ngOnInit() {
    this.audio.load();

    if(this.presetService.getPreset()) {
      const preset = this.presetService.getPreset();

      this.tempo = preset.tempo;
      this.beatvolume = preset.beatvolume;
      this.beats = preset.beats;
      this.tempoTime = 60 / preset.tempo;
    }

    this.presetSubscription = this.presetService.selectedPreset.subscribe((preset) => {
      if (preset) {
        this.tempo = preset.tempo;
        this.beatvolume = preset.beatvolume;
        this.beats = preset.beats;
        this.tempoTime = 60 / preset.tempo;
      }
    });
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
    this.audio.currentTime = 0;
    this.audio.play();
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
    this.audio.volume = this.beatvolume / 100;
  }

  addPreset() {
    const alert = this.alertController.create({
      header: 'Add New Preset',
      message: `
        <div>
          <strong>Current Values:</strong><br>
          <ul>
            <li>Tempo: ${this.tempo}</li>
            <li>Volume: ${this.beatvolume}</li>
            <li>Beats: ${this.beats}</li>
          </ul>
        </div>
      `,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Preset Name',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: (data) => {
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
      ],
    });
  
    alert.then((alertElement) => alertElement.present());
  }  
}

