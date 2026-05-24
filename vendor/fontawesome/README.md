# Font Awesome Local Packages

Place downloaded Font Awesome `.tgz` package files in this folder when the project should install Pro packages without relying on the private npm registry.

After the tarballs are present, update `package.json` dependencies to use `file:vendor/fontawesome/<package-file>.tgz` paths and run:

```bash
npm install
npm run verify
```

