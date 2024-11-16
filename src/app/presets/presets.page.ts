import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PresetService } from 'src/app/services/preset.service';
import { AlertController, NavController } from '@ionic/angular';
import { Preset } from '../models/preset.model';

@Component({
  selector: 'app-presets',
  templateUrl: './presets.page.html',
  styleUrls: ['./presets.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonButton,
  ],
})
export class PresetsPage {
  presets: any[] = [];

  constructor(
    private presetService: PresetService,
    private alertController: AlertController,
    private navController: NavController
  ) {}

  async ngOnInit() {
    this.presets = await this.presetService.loadPresets();
  }

  async ionViewWillEnter() {
    this.presets = await this.presetService.loadPresets();
  }

  selectPreset(preset: Preset) {
    this.presetService.selectPreset(preset);
    this.navController.navigateForward('/tabs/metronome');
  }

  deletePreset(presetName: string) {
    this.presetService.deletePreset(presetName);
    this.presets = this.presets.filter((p) => p.name !== presetName);
  }
}
