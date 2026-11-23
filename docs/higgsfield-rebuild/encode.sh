#!/usr/bin/env bash
# Web encode for one Higgsfield clip or still → public/media/higgsfield/<section>/.
#
#   encode.sh video <in.mp4> <out_base> <WxH> <start_s> <dur_s> [xfade_s=0.8]
#   encode.sh still <in.png|jpg> <out_base> <WxH> [crop=w:h:x:y applied first]
#   encode.sh reel  <out_base> <WxH> <in1.mp4> <in2.mp4> ...   (hero: scenes dissolve into each other)
#
# LOOP=xfade (default) | pingpong (forward then reversed: camera moves that do not
# return to their first frame) | once (no loop edit: the page plays it once and holds).
#
# video: audio stripped, trimmed, the tail cross-faded into the head so the loop
#        has no visible seam, scaled+cropped to WxH (cover), then
#        <out_base>.mp4 (H.264 high, faststart) + <out_base>.webm (VP9) and the
#        loop's first frame as the poster <out_base>.avif + <out_base>.webp.
# still: <out_base>.avif + <out_base>.webp at WxH (cover).
# Budgets (prompt): hero ≤ 2.5 MB, section loops ≤ 1.5 MB, posters ≤ 120 KB.
set -euo pipefail
mode=$1; in=$2; out=$3; size=$4
W=${size%x*}; H=${size#*x}
mkdir -p "$(dirname "$out")"
cover="scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}"

poster() { # $1 = source image/video frame
  local tmp; tmp=$(mktemp -t hfposter).png
  ffmpeg -loglevel error -y -i "$1" -vf "$cover" -frames:v 1 "$tmp"
  ffmpeg -loglevel error -y -i "$tmp" -c:v libsvtav1 -svtav1-params log-level=0 -crf ${PCRF:-32} -preset 4 -pix_fmt yuv420p -frames:v 1 "$out.avif"
  cwebp -quiet -q ${PQ:-78} -m 6 "$tmp" -o "$out.webp"
  rm -f "$tmp"
}

if [ "$mode" = still ]; then
  if [ -n "${5:-}" ]; then
    src=$(mktemp -t hfcrop).png; ffmpeg -loglevel error -y -i "$in" -vf "crop=$5" "$src"; in=$src
  fi
  poster "$in"; ls -l "$out".avif "$out".webp | awk '{print $5, $9}'; exit 0
fi

crf=${CRF:-22}; vcrf=${VCRF:-33}
web() { # $1 = filtergraph ending in [v], inputs follow
  local fc=$1; shift
  ffmpeg -loglevel error -y "$@" -filter_complex "$fc" -map "[v]" -an \
    -c:v libx264 -profile:v high -preset slow -crf "$crf" -maxrate 2.6M -bufsize 5M -movflags +faststart "$out.mp4"
  ffmpeg -loglevel error -y -i "$out.mp4" -an -c:v libvpx-vp9 -crf "$vcrf" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$out.webm"
  poster "$out.mp4"
  ls -l "$out".mp4 "$out".webm "$out".avif "$out".webp | awk '{print $5, $9}'
}

if [ "$mode" = reel ]; then
  # in = out_base, out = WxH, then the clips: each plays whole and dissolves (1 s) into
  # the next; the last dissolves into the first clip's opening second, so the file
  # starts and ends on the same frame and loops without a seam.
  out=$2; size=$3; W=${size%x*}; H=${size#*x}; shift 3; mkdir -p "$(dirname "$out")"
  cover="scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}"
  x=1; n=$#; ins=(); fc=""; i=0
  for c in "$@"; do ins+=(-i "$c"); fc+="[$i:v]fps=24,${cover},format=yuv420p,setpts=PTS-STARTPTS[c$i];"; i=$((i+1)); done
  fc+="[c0]split[f0][h0];[f0]trim=start=$x,setpts=PTS-STARTPTS[s0];[h0]trim=duration=$x,setpts=PTS-STARTPTS[head];"
  prev=s0; len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"); len=$(echo "$len - $x" | bc -l)
  for i in $(seq 1 $((n-1))); do
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${@:$((i+1)):1}")
    fc+="[$prev][c$i]xfade=transition=fade:duration=$x:offset=$(echo "$len - $x" | bc -l)[r$i];"
    prev=r$i; len=$(echo "$len + $d - $x" | bc -l)
  done
  fc+="[$prev][head]xfade=transition=fade:duration=$x:offset=$(echo "$len - $x" | bc -l),format=yuv420p[v]"
  web "$fc" "${ins[@]}"
  exit 0
fi

ss=$5; d=$6; x=${7:-0.8}
src="[0:v]trim=start=${ss}:duration=${d},setpts=PTS-STARTPTS,fps=24,${cover},format=yuv420p"
case "${LOOP:-xfade}" in
  once) fc="${src}[v]" ;;
  pingpong) fc="${src},split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0,trim=end_frame=$(echo "($d*24*2-2)/1" | bc),format=yuv420p[v]" ;;
  *) off=$(echo "$d - 2*$x" | bc -l)
     fc="${src},split[a][b];[a]trim=start=${x},setpts=PTS-STARTPTS[m];[b]trim=duration=${x},setpts=PTS-STARTPTS[h];\
[m][h]xfade=transition=fade:duration=${x}:offset=${off},format=yuv420p[v]" ;;
esac
# Section loops target ~1.2 MB, the hero ~2 MB: tune by size (portrait 720×1280 ≈ landscape 1280×720).
web "$fc" -i "$in"
