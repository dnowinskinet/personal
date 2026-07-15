import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MetaService } from '@core/services/meta.service';

import { PrivacyPage } from './privacy';

describe('PrivacyPage', () => {
  it('renders the complete privacy policy and sets metadata', async () => {
    const metaService = jasmine.createSpyObj<MetaService>('MetaService', ['setMetaTags']);

    await TestBed.configureTestingModule({
      imports: [PrivacyPage],
      providers: [
        provideRouter([]),
        { provide: MetaService, useValue: metaService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PrivacyPage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Privacy Policy');
    expect(host.textContent).toContain('Effective date: July 15, 2026');
    expect(host.querySelectorAll('h2').length).toBe(17);
    expect(host.textContent).toContain('The Site’s application does not currently set cookies.');
    expect(host.querySelector('a[href="/"]')?.textContent?.trim()).toBe('dnowinski.com');
    expect(metaService.setMetaTags).toHaveBeenCalledWith(
      'Privacy Policy - Daniel T Nowinski',
      'Privacy practices for dnowinski.com, including local browser storage and the limited technical information processed by hosting providers.',
      ['privacy policy', 'local storage', 'dnowinski.com']
    );
  });
});
