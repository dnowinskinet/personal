import { PrivacyPage } from './pages/legal/privacy/privacy';
import { TermsPage } from './pages/legal/terms/terms';
import { routes } from './app-routing.module';

describe('application routes', () => {
  it('exposes lazy privacy and terms routes before the wildcard', async () => {
    const privacyRoute = routes.find((route) => route.path === 'privacy');
    const termsRoute = routes.find((route) => route.path === 'terms');

    expect(await privacyRoute?.loadComponent?.()).toBe(PrivacyPage);
    expect(await termsRoute?.loadComponent?.()).toBe(TermsPage);
    expect(routes.at(-1)?.path).toBe('**');
  });
});
