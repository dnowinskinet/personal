import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';

@Component({
  selector: 'app-experimental',
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss'
})
export class ExperimentalComponent {
  metaService = inject(MetaService)
  constructor(){
    this.metaService.setMetaTags(
      `About - ${profileData.name}`,
      'Dive into a curated space to learn more about the person behind the name',
      ['bio', 'biography', 'information', 'about', 'contact', 'detail']
      )
  }

}
