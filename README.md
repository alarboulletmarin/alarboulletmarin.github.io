# alarboulletmarin.github.io

My portfolio: one band per app, the one you pick opens with a small live demo.
Built from the "Nuancier" design. Vite + React, no other dependency.

```sh
npm install
npm run dev      # local server
npm run build    # static site in dist/
```

Some demos run the real engines of my apps, copied into `vendor/` by
`node scripts/vendor.mjs` (it expects the app repos next to this one):
[dada](https://github.com/alarboulletmarin/dada) (`src/game`) and
[aplat](https://github.com/alarboulletmarin/aplat) (`src/lib`). Do not edit
`vendor/` by hand: change the app, then run the script again.

Every push to `main` is built and published to GitHub Pages by `.github/workflows/pages.yml`.

## License

AGPL-3.0, like the dada and aplat engines it embeds. See `LICENSE`.
