import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonRange, IonHeader, IonToolbar, IonTitle, IonRange, IonLabel, IonContent, ExploreContainerComponent, FormsModule],
})
export class Tab1Page {
  rotationAngle: number = -45;
  tempo: number = 60;
  tempoTime: number = 1;
  interval!: ReturnType<typeof setInterval>; // because in Node, setInterval returns a Timeout object, while in the browser it returns a number

  constructor() {}

  ngOnInit() {
    this.interval = setInterval(() => {
      if (this.rotationAngle === -45) {
        this.rotationAngle = 45;
      } else {
        this.rotationAngle = -45;
      }
    }, this.tempoTime * 1000);
  }

  

  tempoChange() {
    this.tempoTime = 60/this.tempo;

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.rotationAngle == -45) {
        this.rotationAngle = 45;
      }
      else {
        this.rotationAngle = -45;
      }
    }, this.tempoTime * 1000);
  }
}
