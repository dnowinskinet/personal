import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject, OnInit, Input, afterNextRender } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import {FlowbiteService} from '../../core/services/flowbite.service';
import profileData from '@data/profile.data';

@Component({
  selector: 'app-experimental',
  standalone: true,
  imports: [],
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  metaService = inject(MetaService);
  constructor() {
    this.metaService.setMetaTags(
      `Home - ${profileData.name}`,
      'Welcome to my person website. Its a mess, for now.',
      [
        'daniel thomas nowinski',
        'daniel thomas',
        'danielthomasnowinski',
        'data scientist',
        'dc',
        'bio',
        'developer',
        'portfolio',
        'development',
        'android',
        'web',
        'ios',
      ]
    );
  };
}

