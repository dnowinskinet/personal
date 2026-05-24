# Font Awesome Source

Put the full downloaded Font Awesome asset folders here.

This folder is ignored by Git except for this README because the full Font Awesome download contains many files. It is a local source cache, not the app's live asset folder.

A future sync script can copy only the icons/assets the app actually uses into a tracked asset folder such as:

```text
src/assets/fontawesome/
```

Expected source folders may include:

- `css/`
- `metadata/`
- `scss/`
- `svgs/`
- `svgs-full/`
- `webfonts/`

Avoid committing the full download.
