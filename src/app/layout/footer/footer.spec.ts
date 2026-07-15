import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders semantic footer and absolute legal links', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const legalNav = host.querySelector('nav[aria-label="Legal"]');
    const links = [...host.querySelectorAll('nav[aria-label="Legal"] a')] as HTMLAnchorElement[];
    const easternYear = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      timeZone: 'America/New_York',
    }).format(new Date());

    expect(host.querySelector('footer')).not.toBeNull();
    expect(legalNav).not.toBeNull();
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/privacy', '/terms']);
    expect(host.textContent).toContain(`© ${easternYear} Daniel T Nowinski`);

    fixture.destroy();
  });

  it('formats summer and winter time in America/New_York', () => {
    const fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;

    expect(component.getCurrentTime(new Date('2026-07-15T16:05:00Z'))).toBe('12:05 PM');
    expect(component.getCurrentTime(new Date('2026-01-15T17:05:00Z'))).toBe('12:05 PM');

    fixture.destroy();
  });

  it('preserves accessible names for every social link', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const socialLinks = [...fixture.nativeElement.querySelectorAll('social-link a')] as HTMLAnchorElement[];

    expect(socialLinks.length).toBeGreaterThan(0);
    expect(socialLinks.every((link) => Boolean(link.getAttribute('aria-label')))).toBeTrue();

    fixture.destroy();
  });
});
