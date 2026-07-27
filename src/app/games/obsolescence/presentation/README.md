# presentation/

Angular-facing view models. Translates simulation state into something a template can bind to.

**May import:** `sim`, `content`.

Angular owns all text-heavy and accessible UI (R8). This layer is the seam between a
framework-free kernel and Angular components, so components never reach into `sim/` directly.

Empty until Gate A.
