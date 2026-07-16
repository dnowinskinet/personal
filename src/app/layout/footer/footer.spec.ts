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

  it('renders the compact footer with the current year and absolute legal links', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const legalNav = host.querySelector('nav[aria-label="Legal"]');
    const links = [...host.querySelectorAll('nav[aria-label="Legal"] a')] as HTMLAnchorElement[];

    expect(host.querySelector('footer')).not.toBeNull();
    expect(legalNav).not.toBeNull();
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/privacy', '/terms']);
    expect(host.textContent).toContain(`© ${new Date().getFullYear()}`);
    expect(host.textContent).toContain('Daniel T Nowinski');
    expect(host.querySelectorAll('footer > div > *').length).toBe(3);

    fixture.destroy();
  });

  it('does not render a clock or retain clock formatting behavior', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).not.toContain('Eastern Time');
    expect('getCurrentTime' in fixture.componentInstance).toBeFalse();

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
