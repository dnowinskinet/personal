import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MetaService } from '@core/services/meta.service';

import { TermsPage } from './terms';

describe('TermsPage', () => {
  it('renders the complete terms and sets metadata', async () => {
    const metaService = jasmine.createSpyObj<MetaService>('MetaService', ['setMetaTags']);

    await TestBed.configureTestingModule({
      imports: [TermsPage],
      providers: [
        provideRouter([]),
        { provide: MetaService, useValue: metaService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TermsPage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Terms of Use');
    expect(host.textContent).toContain('Effective date: July 15, 2026');
    expect(host.querySelectorAll('h2').length).toBe(21);
    expect(host.querySelector('a[href="/privacy"]')?.textContent?.trim()).toBe('Privacy Policy');
    expect(metaService.setMetaTags).toHaveBeenCalledWith(
      'Terms of Use - Daniel T Nowinski',
      'Terms governing use of dnowinski.com, including its games, public source code, third-party marks, and automated access.',
      ['terms of use', 'website terms', 'dnowinski.com']
    );
  });
});
