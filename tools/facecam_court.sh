#!/usr/bin/env bash
# Extrait vertical (Shorts, Reels, TikTok) d'une vidéo face caméra filmée à l'horizontale (décision du 23/10/2026).
# Usage : tools/facecam_court.sh <vidéo source> <sortie .mp4>
# - coupe à la première pause d'au moins 1,2 s entre 25 et 60 s (Bradley marque une pause après le résumé du début) ;
#   sans pause trouvée : coupe à 45 s ;
# - recadre au centre en 9:16, 1080 x 1920, son normalisé, fichier léger (< 20 Mo pour jsDelivr) ;
# - écrit aussi <sortie>-couverture.jpg (image à 2 s) et affiche la durée retenue.
# Si la vidéo est déjà verticale, elle n'est pas recadrée.
set -euo pipefail
SRC="$1"; OUT="$2"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SRC")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$SRC")
ROT=$(ffprobe -v error -select_streams v:0 -show_entries stream_side_data=rotation -of csv=p=0 "$SRC" | head -1 || true)
if [ -n "$ROT" ] && [ "${ROT#-}" = "90" ]; then T=$W; W=$H; H=$T; fi
CUT=$(ffmpeg -hide_banner -nostats -i "$SRC" -af silencedetect=noise=-35dB:d=1.2 -f null - 2>&1 \
  | awk '/silence_start/{s=$NF} /silence_end/{if (s>=25 && s<=60 && !done){print s; done=1}}')
CUT=${CUT:-45}
if [ "$W" -gt "$H" ]; then VF="crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos"; else VF="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"; fi
ffmpeg -hide_banner -loglevel error -y -i "$SRC" -t "$CUT" -vf "$VF,fps=30" -c:v libx264 -preset medium -crf 25 -maxrate 3500k -bufsize 7000k \
  -pix_fmt yuv420p -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 128k -ar 48000 -movflags +faststart "$OUT"
ffmpeg -hide_banner -loglevel error -y -ss 2 -i "$OUT" -frames:v 1 -q:v 3 "${OUT%.mp4}-couverture.jpg"
SZ=$(stat -c %s "$OUT")
echo "extrait: ${CUT}s, $((SZ/1024)) Ko, source ${W}x${H}"
[ "$SZ" -lt 20000000 ] || { echo "fichier trop lourd pour jsDelivr"; exit 1; }
