# MEDIA MARKT – MACSKAKATASZTRÓFA 🐈📺

> „Mert hülye azért nem vagyok… de a macska igen!”

Humorosan kaotikus, böngészőben futó ügyességi játék. **Dagadék**, a rosszcsont macska lelöki a termékeket a polcokról, te pedig – **Laci** vagy **Luca**, a szerencsétlen bolti alkalmazott – rohansz, felveszed és visszarakod őket a helyükre, mielőtt a főnök kirúg.

**Játék:** https://zsirafmix.github.io/mediamarkt-macskakatasztrofa/

## Irányítás

| Billentyű | Funkció |
|---|---|
| A / D vagy ← / → | mozgás |
| W / ↑ | ugrás (magas polcokhoz) |
| S / ↓ | leugrás a lépcsőről |
| E | termék felvétele |
| SPACE | visszahelyezés a saját helyére |
| SHIFT | gyors futás (korlátozott energia) |
| P / ESC | szünet |
| M | hang ki/be |

Telefonon: érintőgombok (◀ ▶, SPRINT, FELVESZ, VISSZARAK, UGRÁS), fekvő módban, teljes képernyő gombbal.

## Játékmenet

- Egyszerre **2** terméket vihetsz (Takarítókocsival 5-öt). A zöld szaggatott keret és nyíl mutatja a termék helyét; rossz helyre nem teheted.
- A nehéz termékeket (laptop, tévé) lassabban veszed fel és rakod vissza, és lassabban futsz velük.
- A zuhanó terméket **elkaphatod**, ha alatta állsz.
- **FŐNÖK DÜHE**: minél több termék van a földön, annál gyorsabban nő; visszarakáskor csökken. 25% gyanakszik, 50% telefonál, 75% üvöltözik, 90% vörös fejjel rohangál, 100% → **KI VAGY RÚGVA!**
- A macska egyre gyorsabb: 0–30 mp 5 mp-enként, 30–60 mp 3 mp-enként, 1–2 perc 2 mp-enként, 2–3 perc 1 mp-enként, 3 perc után 0,5 mp-enként lök le valamit.
- Visszatérő poén: ha visszaraksz egy tévét, Dagadék odasétál, a szemedbe néz, lassan felemeli a mancsát… és újra lelöki.
- Események: MACSKAŐRÜLET, FŐNÖKI ELLENŐRZÉS, DOMINÓ-effektus, A MACSKA ÁRTATLAN, MÉG EGY MACSKA?! (5:00 után).
- Bónuszok: Kávészünet, Macskamenta, Takarítókocsi, Főnök szabadságon, Automata polcrendező.
- A rekordot a böngésző tárolja (localStorage).

## Technika

Tiszta HTML5 Canvas + JavaScript, nincs külső könyvtár, CDN vagy backend. A hangok és a háttérzene WebAudio-val, valós időben készülnek.

```
index.html, css/style.css
js/util.js    – konstansok, termékek, időtábla
js/audio.js   – szintetizált hangok és áruházi zene
js/art.js     – procedurális grafika (áruház, termékek, szereplők, Dagadék, főnök)
js/game.js    – játéklogika, fizika, macska-AI, események, bónuszok
js/render.js  – kirajzolás, HUD
js/ui.js      – menük, billentyűzet, érintés, debug/teszt hookok
assets/images – rajzfilmesített fejek (az eredeti fotók nincsenek a repóban)
```

Helyi futtatás: `python3 -m http.server` a mappában, majd http://localhost:8000. Teszt hookok: `?debug=1` (`MM.test.*`, pl. `MM.test.timeScale(10)`).

Paródia rajongói játék, nem hivatalos MediaMarkt termék; a logó saját, szöveges utánzat.
