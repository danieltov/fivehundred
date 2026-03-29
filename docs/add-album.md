# Adding a New Album

Tell Claude: "Add [album title] by [artist] to my data." Then provide the three things only you know:

| Field | Notes |
|-------|-------|
| `owned` | true / false — default false |
| `isAPlus` | true if it grades A+, default false |
| `topRanking` | number if it's in your top 50, default null |

Everything else Claude looks up.

---

## Data Sources

### Genres + Descriptors — RYM (preferred over AllMusic)

RYM genres are more granular and accurate. RYM descriptors are available and rich; AllMusic descriptors are JavaScript-rendered and inaccessible without a browser.

**RYM blocks direct fetch (403).** Use Cloudflare Browser Rendering:

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/5edf3764c78cb95c274b22f36088811b/browser-rendering/content" \
  -H "Authorization: Bearer cfat_C8RDVSrNNmeiHMN3awj32xr1SJYgKcsKLd9wU3zl1c1205b3" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://rateyourmusic.com/release/album/{artist}/{album-slug}/"}' \
  | python3 -c "
import sys, re, json
data = json.loads(sys.stdin.read())
html = data['result']
text = re.sub(r'<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text)
for m in re.finditer(r'.{0,50}[Dd]escriptor.{0,500}', text):
    print(m.group().strip())
"
```

This returns fully JavaScript-rendered HTML. Look for the `Descriptors` and genre sections in the output.

**Note on Cloudflare rate limits:** If you get `{"code":2001,"message":"Rate limit exceeded"}`, wait a few seconds and retry.

### Cover Art — Self-hosted in `public/covers/`

Cover art is downloaded locally at build time and served from `/covers/{slug}.jpg`. Do **not** put a raw CAA URL in `albums.json` — download the image first.

**Step 1: Find the release-group MBID** (not the release MBID) via MusicBrainz search or:

```bash
curl -s "https://musicbrainz.org/ws/2/release/{release-mbid}?fmt=json&inc=release-groups" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['release-group']['id'])"
```

**Step 2: Download the image** at 500px and set the path:

```bash
python3 -c "
import urllib.request
slug = '{album-slug}'
mbid = '{release-group-mbid}'
url = f'https://coverartarchive.org/release-group/{mbid}/front-500'
req = urllib.request.Request(url, headers={'User-Agent': 'fivehundred/1.0'})
with urllib.request.urlopen(req) as r:
    open(f'public/covers/{slug}.jpg', 'wb').write(r.read())
print('done')
"
```

Then set `coverArt` in the album entry to `/covers/{slug}.jpg`.

### Apple Music URL

Web search: `"album title" "artist" site:music.apple.com`

### Spotify URI

Web search: `"album title" "artist" site:open.spotify.com`

Convert URL to URI: `open.spotify.com/album/{id}` → `spotify:album:{id}`

**Note:** Multiple results sometimes appear (regional/legacy releases). Flag ambiguity — don't silently pick one.

---

## After Appending the Entry

New entries go at the **top** of the `albums` array in `data/albums.json`, not the bottom.



### 1. Assign accent color bucket

Set `accentBucket` on the album object in `data/albums.json`:

```json
"accentBucket": "bucket"
```

Assess based on the **first 5–6 descriptors** (they are ordered by definitional weight). Assign one of:

| Bucket | Signal words |
|--------|-------------|
| `cold` | dark, nocturnal, bleak, melancholic, lonely, haunting, ominous, brooding |
| `warm` | uplifting, happy, summer, love, joyful, playful, sensual, celebratory |
| `dreamy` | psychedelic, hypnotic, ethereal, surreal, lush, atmospheric, tender, romantic |
| `fierce` | political, protest, aggressive, energetic, rebellious, confrontational, raw, intense |
| `pastoral` | acoustic, gentle, wistful, bittersweet, nostalgic, peaceful, intimate |
| `null` | descriptors are purely factual/technical — no emotional signal (e.g. "rhythmic, sampling, conscious, male vocalist") |

Ignore factual/technique descriptors when making the call: `male vocalist`, `female vocalist`, `sampling`, `lo-fi`, `conscious`, `instrumental`, `improvisation`.

### 2. Apply genre audit rules and check for unmapped slugs:

```bash
# Apply genre audit (collapses + removals) to the new entry
node scripts/apply-genre-audit.js

# Check for unmapped descriptor or genre slugs
node -e "
const albums = require('./data/albums.json').albums
const colorMap = require('./data/descriptor-color-map.json')
const labelMap = require('./data/genre-display-labels.json')
const newDesc = [...new Set(albums.flatMap(a => a.descriptors.map(d => d.slug)))].filter(s => !(s in colorMap))
const newGenre = [...new Set(albums.flatMap(a => a.genres.map(g => g.slug)))].filter(s => !(s in labelMap))
console.log('Unmapped descriptor slugs:', newDesc)
console.log('Unmapped genre slugs:', newGenre)
"
```

If anything prints: add entries to `data/descriptor-color-map.json` and/or `data/genre-display-labels.json` manually or via a small subagent call.

---

## Notes on RYM vs AllMusic Descriptors

RYM descriptors use lowercase, community-voted tags. Some correspond to existing AllMusic slugs in the dataset; others are new. When adding RYM descriptors:

- Slugify: lowercase, replace non-alphanumeric with `-`
- Check if the slug exists in `descriptor-color-map.json`
- For new slugs: assign a bucket (`cold`, `warm`, `dreamy`, `fierce`, `pastoral`) or `null` for factual/technique tags (e.g. `male-vocalist`, `lo-fi`, `sarcastic`)
- `twee-pop` was collapsed to `indie-pop` in the genre audit — apply that mapping

---

## RYM Genre Audit Alignment

Some RYM genres were collapsed or removed in the genre audit. Apply the same rules:

- `twee-pop` → `indie-pop`
- `poprock` → removed (drop entirely)
- `contemporary-poprock` → removed
- See `data/genre-audit-results.json` for the full collapse + remove list
