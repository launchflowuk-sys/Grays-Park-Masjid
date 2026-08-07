# Audio licences

Every recording served from this directory must have a licence recorded here,
with a source URL that can be re-checked. If you cannot evidence the licence,
it does not go in.

## adhan-icr-cc0.mp3 — current default (standard and Fajr)

- **Recording:** ICR Friday Prayer, 1st Adhan (Jumu'ah Azan al-Awwal), 17 May 2024
- **Muezzin:** Asim Javed
- **Licence:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) — public domain dedication, no attribution required
- **Source:** https://archive.org/details/icr-friday-prayer-1st-adhan-17th-may-2024-9th-dhul-qadah-1445-by-asim-javed
- **Duration / size:** 3:40, ~2.1 MB, VBR MP3

## adhan-azeez-ccbysa.mp3 — alternative, not currently used

- **Recording:** The Adhan — Muslim Call to Prayer
- **Muezzin:** Aaqib Azeez
- **Licence:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — **attribution required** if used
- **Source:** https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3
- **Duration / size:** 1:27, ~1.4 MB, ~130 kbps

Shorter and higher-bitrate than the CC0 recording. If you switch to it, credit
"Aaqib Azeez, CC BY-SA 4.0" somewhere user-visible (About or Settings).

## adhan-alafasy.mp3, adhan-fajr-makkah.mp3, adhan-makkah.mp3 — compatibility paths

These filenames are compiled into TestFlight build 12, so the paths must keep
resolving or the adhan 404s in that build. **They now serve the CC0 recording
above**, not what their names suggest.

They previously held recordings with no licence we could evidence:

- `adhan-fajr-makkah.mp3` — ID3 tags pointed at muslimpro.com and a YouTube URL
- `adhan-makkah.mp3` — originally streamed from cdn.prayertimes.net, no licence
- `adhan-alafasy.mp3` — tags stripped, no recorded provenance

Retire these paths once no shipped build references them.

## Outstanding

Fajr currently uses the standard adhan, so it is missing
"As-salatu khayrun min an-nawm". A freely-licensed Fajr recitation still needs
sourcing — or record the masjid's own muezzin, which settles it permanently.
