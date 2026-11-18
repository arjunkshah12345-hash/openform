# Openform motion launch film

A 30-second editorial product film, built and rendered in Remotion. Typography and interfaces carry the story with sound off; original synthesized music adds light rhythm with sound on.

## Final artifacts

- `video/out/openform-launch.mp4` — landscape 1920×1080, 30fps, H.264, AAC stereo 48kHz.
- `video/out/openform-launch-portrait.mp4` — native portrait 1080×1350, 30fps, H.264, AAC stereo.
- `video/out/thumbnail.png` — landscape frame featuring the product and brand.
- `video/out/openform-social.png` — 1200×630 PNG, ready for site metadata.
- `video/out/contact-sheet.jpg` and `contact-sheet-portrait.jpg` — six sampled scenes per format.

Both video streams contain exactly 900 frames / 30 seconds. MP4 container duration is 30.016 seconds because AAC encoding adds a small audio tail. The final audio mean is −23.5dB and peak −10.2dB; no clipping. TypeScript check passes.

## Creative direction

Warm paper, forest green, sage, peach, lilac, and a restrained lime brand mark. DM Serif Display headlines paired with DM Sans. Physical card movement, eased entrances, typed answers, staggered options, changing editor themes, response reveal, and a decisive forest-green closing card. The portrait version rearranges content natively rather than cropping the landscape film.

## Story and truthfulness

Forms should feel like a conversation → Meet Openform → Build → Ask → Listen → Your questions, your data, your code → Open source, MIT licensed.

The sample response is labeled as a product demonstration. No fabricated traction, customers, conversion statistics, or live-publication claims. Centralized response viewing refers to the self-hosted app; GitHub Pages remains a browser-local demo.

## Licensing and publication

Artwork, motion source, synthesis script, and synthesized soundtrack are original project assets under the repository MIT license. Bundled fonts carry their SIL Open Font License notices in `video/public/fonts/`. Dependencies retain their own licenses. No stock footage, commercial music, third-party recording, or generated voice is used.

Rendered outputs are ignored by Git. Editable source and source assets are included in `video/`. No social post is published or scheduled by the video project. Attach the chosen MP4 only after approval of the exact post, platform, account, and media.
