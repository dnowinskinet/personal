import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject,Injectable, OnInit, Input, afterNextRender } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  standalone: true,
  imports: [NgbAccordionModule],
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

