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
  IonButton, IonAlert } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PresetService } from 'src/app/services/preset.service';
import { AlertController, NavController } from '@ionic/angular';
import { Preset } from '../models/preset.model';

@Component({
  selector: 'app-presets',
  templateUrl: './presets.page.html',
  styleUrls: ['./presets.page.scss'],
  standalone: true,
  imports: [IonAlert, 
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
  isAlertVisible: boolean = false;
  presetToDelete: string = "";

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel'
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.presetService.deletePreset(this.presetToDelete);
        this.presets = this.presets.filter((p) => p.name !== this.presetToDelete);
        this.isAlertVisible = false;
      },
    },
  ];

  constructor(
    private presetService: PresetService,
    private navController: NavController,
    private alertController: AlertController
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

  async deletePreset(presetName: string) {
    const alert = await this.alertController.create({
      header: 'Delete Preset',
      message: `Are you sure you want to delete the preset "${presetName}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.presetService.deletePreset(presetName).subscribe({
              next: () => {
                this.presets = this.presets.filter((p) => p.name !== presetName);
                console.log(`Preset "${presetName}" deleted successfully.`);
              },
              error: (err) => {
                console.error(`Error deleting preset "${presetName}":`, err);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
