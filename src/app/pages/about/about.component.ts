import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent { 
  metaService = inject(MetaService)
  constructor(){
    this.metaService.setMetaTags(
      `About - ${profileData.name}`,
      'Dive into a curated space to learn more about the person behind the name',
      ['bio', 'biography', 'information', 'about', 'contact', 'detail']
      )
  }
  public contactInfo = [
    {
      title: 'Address',
      desc: `Washington, D.C.`,
      link: 'https://maps.app.goo.gl/nZuQD3utJi5AtVmu9'
    },
    {
      title: 'Email',
      desc: 'hello@dnowinski.com',
      link: 'mailto:hello@dnowinski.com'
    }
  ]
  bioImg ="../../../assets/image/biography.jpg" 
}