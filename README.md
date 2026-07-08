# Office Rush — Task Board Edition

Browser office RPG. Single canvas game, no build step — just open `index.html`.

## File structure

```
office-rush/
├── index.html          ← page skeleton, screens (menu, dialog, mini-game, HUD)
├── css/
│   └── style.css        ← all styles (CRT monitor, HUD, dialog, screens...)
├── js/
│   ├── game.js           ← ALL GAME LOGIC — this is the file to edit 99% of the time
│   ├── sprites-data.js    ← base64 character sprite sheets (large, rarely touched)
│   ├── map-data.js        ← base64 office map background (large, rarely touched)
│   └── koda-data.js       ← base64 dog sprite (large, rarely touched)
└── README.md
```

## Why split like this?

The original single-file version was ~6MB because character sprites and the
map background are embedded as base64 image data directly in the HTML. That's
fine for the browser, but painful to edit — every tool that opens the file
(including Claude) has to load megabytes of image data just to see a few
lines of game logic.

Splitting it means:
- `game.js` is ~120KB and holds 100% of the actual gameplay code.
- The `*-data.js` files hold nothing but images and almost never change.
- Diffs in git stay small and readable — editing a mini-game shows up as a
  small diff in `game.js`, not a multi-megabyte blob.

## Editing workflow (git bash / local)

```bash
git clone <your-repo-url>
cd office-rush
# edit js/game.js, css/style.css, or index.html
git add -A
git commit -m "tweak collision grid"
git push
```

Just open `index.html` directly in a browser to test (double-click it, or
`start index.html` / `open index.html` from git bash).

## Regenerating a data file

If you re-export a new office map (`mapasset*.png`) or new character sprites,
only `map-data.js` / `sprites-data.js` needs to be replaced — the format is:

```js
// map-data.js
const MAP_BG = new Image();
MAP_BG.src = "data:image/png;base64,....";
```

```js
// sprites-data.js
const SPRITE_B64 = {
  dejan: "....",
  teonem: "....",
  ...
};
```

`game.js` converts `SPRITE_B64` into `SPRITES{}` (Image objects) at the top,
so nothing else needs to change when you swap sprite data.
