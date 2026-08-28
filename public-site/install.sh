#!/bin/sh
set -eu

manifest_url="https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest/download/latest.json"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT INT TERM

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) platform="mac-arm64" ;;
  Darwin-x86_64) platform="mac-intel" ;;
  Linux-x86_64) platform="linux-appimage" ;;
  *) echo "Choir Cleanup does not yet publish a build for $(uname -s) $(uname -m)." >&2; exit 1 ;;
esac

curl -fsSL "$manifest_url" -o "$tmp_dir/latest.json"
asset_url="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["platforms"][sys.argv[2]]["url"])' "$tmp_dir/latest.json" "$platform")"
expected="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["platforms"][sys.argv[2]]["sha256"])' "$tmp_dir/latest.json" "$platform")"
asset="$tmp_dir/$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["platforms"][sys.argv[2]]["file"])' "$tmp_dir/latest.json" "$platform")"
curl -fL "$asset_url" -o "$asset"
actual="$(sha256sum "$asset" 2>/dev/null | awk '{print $1}' || shasum -a 256 "$asset" | awk '{print $1}')"
[ "$actual" = "$expected" ] || { echo "Checksum verification failed; nothing was installed." >&2; exit 1; }

if [ "$(uname -s)" = "Darwin" ]; then
  mount_dir="$tmp_dir/mount"; mkdir "$mount_dir"; hdiutil attach "$asset" -nobrowse -quiet -mountpoint "$mount_dir"
  destination="/Applications"; [ -w "$destination" ] || { destination="$HOME/Applications"; mkdir -p "$destination"; }
  cp -R "$mount_dir"/*.app "$destination/"; hdiutil detach "$mount_dir" -quiet
  echo "Verified SHA256 and installed Choir Cleanup in $destination. Right-click it and choose Open on first launch (unsigned build)."
else
  destination="$HOME/.local/bin/choir-cleanup"; mkdir -p "$HOME/.local/bin"; cp "$asset" "$destination"; chmod +x "$destination"
  desktop_dir="$HOME/.local/share/applications"; mkdir -p "$desktop_dir"
  printf '%s\n' '[Desktop Entry]' 'Name=Choir Cleanup' "Exec=$destination" 'Type=Application' 'Categories=AudioVideo;Audio;' > "$desktop_dir/choir-cleanup.desktop"
  echo "Verified SHA256 and installed Choir Cleanup at $destination. Add $HOME/.local/bin to PATH if needed."
fi
