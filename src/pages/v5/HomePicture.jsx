import { motion } from "framer-motion";
import IMAGES from "./homeImages.json";
import "../../styles/home-imagery.css";

/**
 * HomePicture — every photograph on the homepage goes through here.
 *
 * Files come from scripts/home-images/optimise.mjs: public/home/<id>-<variant>-<w>.{avif,webp},
 * with widths and dimensions in homeImages.json, so srcset and width/height can
 * never drift from what is on disk.
 *
 *   <HomePicture id="worth-door" variant="tall" sizes="400px"
 *     art={[{ variant: "wide", media: "(max-width: 820px)", sizes: "100vw" }]} />
 *
 * `art` switches to a different CROP (not just a size) under a media query; the
 * frame's aspect-ratio for that breakpoint is set in CSS by the section, and the
 * <img> fills it (object-fit: cover), so there is no layout shift either way.
 *
 * Render is pure (SSR): no window, no randomness. The reveal is opacity + scale
 * on the <img> inside a clipped frame, once, on entering view. Under
 * MotionConfig reducedMotion="user" framer drops the scale; only the fade runs.
 * Everything here sits below the fold, so it is lazy + async by default.
 */
const src = (id, variant, w, ext) => `/home/${id}-${variant}-${w}.${ext}`;
const set = (id, variant, ext) =>
  IMAGES[id].variants[variant].widths.map((w) => `${src(id, variant, w, ext)} ${w}w`).join(", ");

export default function HomePicture({
  id,
  variant,
  art = [],
  sizes,
  alt = "",
  className = "",
  loading = "lazy",
  reveal = true,
  objectPosition,
}) {
  const img = IMAGES[id];
  if (!img) throw new Error(`HomePicture: unknown image "${id}"`);
  const v = img.variants[variant];
  if (!v) throw new Error(`HomePicture: "${id}" has no variant "${variant}"`);
  const fallbackW = v.widths[Math.min(1, v.widths.length - 1)];
  const Img = reveal ? motion.img : "img";
  const motionProps = reveal
    ? {
        initial: { opacity: 0, scale: 1.035 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, margin: "0px 0px -12% 0px" },
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <picture className={`hp ${className}`} data-placeholder={img.placeholder || undefined}>
      {art.map((a) => {
        const av = img.variants[a.variant];
        return [
          <source key={`${a.variant}-avif`} media={a.media} type="image/avif" srcSet={set(id, a.variant, "avif")} sizes={a.sizes} width={av.w} height={av.h} />,
          <source key={`${a.variant}-webp`} media={a.media} type="image/webp" srcSet={set(id, a.variant, "webp")} sizes={a.sizes} width={av.w} height={av.h} />,
        ];
      })}
      <source type="image/avif" srcSet={set(id, variant, "avif")} sizes={sizes} width={v.w} height={v.h} />
      <source type="image/webp" srcSet={set(id, variant, "webp")} sizes={sizes} width={v.w} height={v.h} />
      <Img
        src={src(id, variant, fallbackW, "webp")}
        width={v.w}
        height={v.h}
        alt={alt}
        loading={loading}
        decoding="async"
        style={objectPosition ? { objectPosition } : undefined}
        {...motionProps}
      />
    </picture>
  );
}
