# Asset Search Workflow

This file records the asset search, license checks, candidate packs, and intake rules for Pollymon. No third-party asset pack has been imported yet. Final import waits for the user's pack choice.

## Intake Rules

- Prefer CC0/public-domain assets.
- Avoid assets with unclear, missing, non-commercial, no-derivatives, or franchise-derived licenses.
- Avoid copyrighted franchise assets, including Pokemon or other recognizable commercial monster-catching game assets.
- Verify the license on the asset page immediately before importing.
- Save the source URL, author, license, downloaded filename, and local file path in `ATTRIBUTION.md`.
- Keep each asset in the closest matching folder under `assets/`.
- Normalize filenames with lowercase kebab-case names, for example `player-walk-down.png`.
- Resize or convert only into project-owned derivative files; keep original downloads in a clearly named `source/` subfolder if imported.
- Keep one visual style per shipped release. Do not mix 10x10 1-bit sprites with 16x16 full-color RPG sprites unless the mismatch is intentional and documented.
- Use project-made placeholders until the final pack is chosen.

## Current Recommendation

Use a Kenney-first visual stack if you want the safest licensing and broadest coverage:

- Kenney Roguelike/RPG Pack for tilemaps, environment props, panels, and small world items.
- Kenney RPG Urban Pack for player/NPC character sprites.
- Kenney Monster Builder Pack for original creature silhouettes.
- Kenney UI Pack (RPG Expansion) for buttons, panels, and RPG UI pieces.
- Kenney RPG Audio for basic field and battle sound effects.

For gaps that Kenney does not fully cover, use OpenGameArt CC0 assets after a second page-level license check.

## Candidate Packs

| Category | Candidate | Author | Source URL | License Signal | Notes |
| --- | --- | --- | --- | --- | --- |
| Player character assets | RPG character sprites | GrafxKid | https://opengameart.org/content/rpg-character-sprites | CC0 listed on page | Compact top-down RPG sprites with templates. |
| Player character assets | RPG Urban Pack | Kenney | https://kenney.nl/assets/rpg-urban-pack | Creative Commons CC0 listed on page | 16x16 urban RPG character pack; consistent with Kenney tiles. |
| NPC assets | NPC and Enemies | Refo | https://opengameart.org/content/npc-and-enemies-0 | CC0 listed on page | 12x16 NPC/enemy sprites; useful fallback. |
| NPC assets | RPG Urban Pack | Kenney | https://kenney.nl/assets/rpg-urban-pack | Creative Commons CC0 listed on page | Best match if using the Kenney stack. |
| Monster/creature assets | Monster Builder Pack | Kenney | https://kenney.nl/assets/monster-builder-pack | Creative Commons CC0 listed on page | Creature parts that can be remixed into original Pollymon designs. |
| Monster/creature assets | RPG Tileset | russpuppy | https://opengameart.org/content/rpg-tileset | CC0 listed on page | Includes small monster-like RPG sprites; style may need alignment. |
| Tilemap assets | Roguelike/RPG Pack | Kenney | https://kenney.nl/assets/roguelike-rpg-pack | Creative Commons CC0 listed on page | 16x16 tiles, town, furniture, buttons, panels. |
| Tilemap assets | RPG Tileset | russpuppy | https://opengameart.org/content/rpg-tileset | CC0 listed on page | 16x16 RPG tile sheet with paths, water, buildings, items, and creatures. |
| Tilemap assets | Bountiful Bits | VEXED | https://v3x3d.itch.io/bountiful-bits | Creative Commons Zero v1.0 Universal listed on page | Strong 10x10 1-bit style; use with Bit Bonanza only. |
| Environment assets | Roguelike/RPG Pack | Kenney | https://kenney.nl/assets/roguelike-rpg-pack | Creative Commons CC0 listed on page | Good for town/field/dungeon props in a consistent 16x16 set. |
| Environment assets | Bountiful Bits | VEXED | https://v3x3d.itch.io/bountiful-bits | Creative Commons Zero v1.0 Universal listed on page | Use if choosing a minimalist 1-bit direction. |
| UI assets | UI Pack (RPG Expansion) | Kenney | https://kenney.nl/assets/ui-pack-rpg-expansion | Creative Commons CC0 listed on page | Panels, buttons, sliders, RPG interface pieces. |
| UI assets | RPG UI Icons | OwlishMedia | https://opengameart.org/content/rpg-ui-icons | CC0 listed on page | 16x16/32x32 UI, item, status, cursor, and symbol icons. |
| Item icons | RPG UI Icons | OwlishMedia | https://opengameart.org/content/rpg-ui-icons | CC0 listed on page | Includes RPG items and medicine tags. |
| Item icons | Bit Bonanza | VEXED | https://v3x3d.itch.io/bit-bonanza | Creative Commons Zero v1.0 Universal listed on page | 10x10 fantasy items/entities; pair with Bountiful Bits. |
| Battle backgrounds | Backgrounds | Nidhoggn | https://opengameart.org/content/backgrounds-3 | CC0 listed on page | RPG battle backgrounds; verify individual files before import. |
| Battle backgrounds | Fantasy Background | titi_son | https://opengameart.org/content/fantasy-background | CC0 listed on page | Static fantasy battle backdrop. |
| Sound effects | RPG Audio | Kenney | https://www.kenney.nl/assets/rpg-audio | Creative Commons CC0 listed on page | RPG foley, footsteps, and weapon sounds. |
| Sound effects | Rpg Sound Effect Pack | Delta12 Studio | https://opengameart.org/content/rpg-sound-effect-pack | CC0 listed on page | OGG effects for grass, item, punch, hurt, door, steps, etc. |
| Music | Fairy Adventure | MintoDog | https://opengameart.org/content/fairy-adventure | CC0 listed on page | Loopable fantasy field music in OGG/FLAC. |
| Music | CC0 Fantasy Music & Sounds | Sir Gawain collection | https://opengameart.org/content/cc0-fantasy-music-sounds | Collection described as CC0; verify each track before import | Use as a discovery pool, not a single imported source. |

## Style Directions To Choose From

### Kenney 16x16 Pixel Stack

Best for fastest integration. Broad CC0 coverage, coherent scale, and easy UI pairing. This is the recommended path.

### VEXED 10x10 1-Bit Stack

Best for a distinctive tiny retro style. Use Bountiful Bits plus Bit Bonanza together; avoid mixing with full-color 16x16 packs.

### OpenGameArt Mixed CC0 Stack

Best for variety, but requires more style curation. Every imported page needs a fresh license check and likely palette normalization.

## Placeholder Status

Project-made placeholder files are stored in `assets/` by category. These are intentionally simple and may be replaced after the final pack is chosen.
