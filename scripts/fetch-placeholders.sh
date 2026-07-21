#!/usr/bin/env bash
# Downloads placeholder photography (picsum.photos, Unsplash-sourced).
# Re-runnable; skips existing files. Swap for client photography later —
# same filenames, no code changes.
set -euo pipefail
dir="src/assets/images"
mkdir -p "$dir"

fetch() { # fetch <picsum-id> <filename> <width> <height>
  local out="$dir/$2"
  [ -f "$out" ] && { echo "skip $2"; return; }
  curl -fsSL "https://picsum.photos/id/$1/$3/$4.jpg" -o "$out"
  echo "got  $2"
}

# Heroes (2000x1300 landscape)
fetch 1018 hero-home.jpg 2000 1300
fetch 1015 hero-rooms.jpg 2000 1300
fetch 429  hero-restaurant.jpg 2000 1300
fetch 1048 hero-events.jpg 2000 1300
fetch 1043 hero-offers.jpg 2000 1300
fetch 1036 hero-explore.jpg 2000 1300
fetch 1039 hero-gallery.jpg 2000 1300
fetch 1044 hero-contact.jpg 2000 1300

# Feature / card images (1200x900)
fetch 1040 feature-rooms.jpg 1200 900
fetch 425  feature-dining.jpg 1200 900
fetch 1016 feature-explore.jpg 1200 900
fetch 1060 dining-detail.jpg 1200 900
fetch 1067 room-family.jpg 1200 900
fetch 1069 room-double.jpg 1200 900
fetch 1075 room-twin.jpg 1200 900
fetch 1080 room-single.jpg 1200 900
