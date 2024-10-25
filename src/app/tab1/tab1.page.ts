import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel, IonItem, IonList, IonButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonButton, IonList, IonItem, IonRange, IonHeader, IonToolbar, IonTitle, IonRange, IonLabel, IonContent, ExploreContainerComponent, FormsModule],
})
export class Tab1Page {
  rotationAngle: number = 0;
  tempo: number = 60;
  tempoTime: number = 1;
  interval!: ReturnType<typeof setInterval>; // because in Node, setInterval returns a Timeout object, while in the browser it returns a number

  volume: number = 50;
  beats: number = 4;

  isPlaying: boolean = false;

  audio = new Audio('assets/beat.mp3');

  constructor() {}

  ngOnInit() {
    this.audio.load();
  }

  tempoChange() {
    this.tempoTime = 60/this.tempo;
    this.metronome();
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
    }
    else {
      this.metronome();
      this.isPlaying = true;
    }
  }
}
