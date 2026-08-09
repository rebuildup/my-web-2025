//! OG image generation endpoint.
//!
//! Serves dynamically generated 1200x630 PNG previews for content entries.
//! Reproduces the layout of the original `src/app/api/og/route.tsx` image
//! (dark background, left content with blue-bordered title + summary + tag
//! chips + profile, right 500x500 thumbnail, rotated slugs along the edges).

use ab_glyph::{Font, FontRef, PxScale, ScaleFont};
use axum::{
    extract::{Path, State},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use image::{
    imageops::{self, FilterType},
    GenericImageView, ImageBuffer, Rgba, RgbaImage,
};
use imageproc::drawing::{
    draw_filled_rect_mut, draw_hollow_rect_mut, draw_text_mut,
};
use serde::Deserialize;
use sqlx::SqlitePool;
use std::sync::OnceLock;

const WIDTH: u32 = 1200;
const HEIGHT: u32 = 630;
const THUMB_SIZE: u32 = 500;
const CONTENT_PAD: i32 = 80;
const CONTENT_GAP: i32 = 40;
const TITLE_BORDER_W: i32 = 12;
const TITLE_PAD: i32 = 32;
const SUMMARY_PAD: i32 = 44; // TITLE_BORDER_W + TITLE_PAD

const FONT_BYTES: &[u8] = include_bytes!("../../assets/NotoSansJP-Bold.ttf");
const SNS_ICON_SVG: &[u8] = include_bytes!("../../assets/sns-icon.svg");

static FONT: OnceLock<FontRef<'static>> = OnceLock::new();
static SNS_ICON: OnceLock<RgbaImage> = OnceLock::new();

#[derive(Debug)]
struct EntryData {
    title: String,
    summary: String,
    tags: Vec<String>,
    slug: String,
    category: String,
}

#[derive(Debug, Deserialize)]
struct ThumbnailExt {
    #[serde(default)]
    thumbnail: Option<ThumbnailInner>,
}

#[derive(Debug, Deserialize)]
struct ThumbnailInner {
    #[serde(default)]
    youtube: Option<String>,
}

#[derive(Debug, Deserialize)]
struct EntryMetadata {
    #[serde(default)]
    ext: Option<ThumbnailExt>,
}

pub fn router(pool: SqlitePool) -> Router {
    Router::new()
        .route("/:id", get(generate_og_image))
        .with_state(pool)
}

fn font() -> &'static FontRef<'static> {
    FONT.get_or_init(|| {
        FontRef::try_from_slice(FONT_BYTES).expect("OG image font must be valid TTF bytes")
    })
}

fn avatar_icon() -> &'static RgbaImage {
    SNS_ICON.get_or_init(rasterize_sns_icon)
}

fn rasterize_sns_icon() -> RgbaImage {
    let opts = resvg::usvg::Options::default();
    let tree = resvg::usvg::Tree::from_data(SNS_ICON_SVG, &opts)
        .expect("SNS icon SVG must be valid");
    let size = tree.size().to_int_size();
    let mut pixmap = resvg::tiny_skia::Pixmap::new(size.width(), size.height())
        .expect("Pixmap allocation must succeed");
    resvg::render(&tree, resvg::tiny_skia::Transform::default(), &mut pixmap.as_mut());
    RgbaImage::from_raw(size.width(), size.height(), pixmap.take())
        .expect("Pixmap data must align with RgbaImage layout")
}

async fn generate_og_image(
    State(pool): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Response, StatusCode> {
    let entry = fetch_entry(&pool, &id)
        .await
        .ok_or(StatusCode::NOT_FOUND)?;

    let metadata = fetch_metadata(&pool, &id).await;
    let thumbnail = fetch_thumbnail(&pool, &id, metadata.as_ref()).await;

    let png = render_og_image(&entry, thumbnail.as_ref()).map_err(|err| {
        tracing::warn!(error = %err, "failed to render OG image");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "image/png"),
            (header::CACHE_CONTROL, "public, max-age=3600"),
        ],
        png,
    )
    .into_response())
}

type EntryRow = (String, Option<String>, Option<String>, Option<String>);

async fn fetch_entry(pool: &SqlitePool, id: &str) -> Option<EntryData> {
    let row: Option<EntryRow> = sqlx::query_as(
        r#"
        SELECT e.title,
               e.summary,
               e.path,
               (SELECT GROUP_CONCAT(t.name)
                  FROM entry_tags et
                  JOIN tags t ON et.tag_id = t.id
                 WHERE et.entry_id = e.id) AS tags
        FROM entries e
        WHERE e.id = ? AND e.deleted_at IS NULL
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten();

    let (title, summary, path, tags) = row?;
    let category = derive_category(path.as_deref().unwrap_or(""));
    Some(EntryData {
        title: nonempty(title),
        summary: clamp_summary(summary.unwrap_or_default()),
        slug: id.to_string(),
        category,
        tags: tags
            .map(|s| {
                s.split(',')
                    .map(|part| part.trim().to_string())
                    .filter(|part| !part.is_empty())
                    .collect()
            })
            .unwrap_or_default(),
    })
}

fn derive_category(path: &str) -> String {
    let segment = path
        .trim_start_matches('/')
        .split('/')
        .next()
        .unwrap_or("")
        .trim();
    if segment.is_empty() {
        "portfolio".to_string()
    } else {
        segment.to_string()
    }
}

fn clamp_summary(s: String) -> String {
    const MAX: usize = 80;
    if s.chars().count() > MAX {
        let truncated: String = s.chars().take(MAX).collect();
        format!("{truncated}...")
    } else {
        s
    }
}

async fn fetch_metadata(pool: &SqlitePool, id: &str) -> Option<EntryMetadata> {
    let raw: Option<String> = sqlx::query_scalar(
        r#"
        SELECT metadata_json
        FROM entry_revisions
        WHERE entry_id = ?
        ORDER BY version DESC, created_at DESC
        LIMIT 1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten();

    raw.and_then(|raw| serde_json::from_str(&raw).ok())
}

async fn fetch_thumbnail(
    pool: &SqlitePool,
    id: &str,
    metadata: Option<&EntryMetadata>,
) -> Option<RgbaImage> {
    if let Ok(Some(media)) = sqlx::query_as::<_, (Vec<u8>, String)>(
        "SELECT data, mime_type FROM media WHERE entry_id = ? ORDER BY created_at ASC LIMIT 1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    {
        if let Ok(img) = image::load_from_memory(&media.0) {
            return Some(img.to_rgba8());
        }
    }

    let youtube_url = metadata
        .and_then(|m| m.ext.as_ref())
        .and_then(|ext| ext.thumbnail.as_ref())
        .and_then(|thumb| thumb.youtube.as_ref());

    if let Some(url) = youtube_url {
        if let Some(yt_id) = extract_youtube_id(url) {
            let thumb_url = format!("https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg");
            if let Ok(resp) = reqwest::get(&thumb_url).await {
                if resp.status().is_success() {
                    if let Ok(bytes) = resp.bytes().await {
                        if let Ok(img) = image::load_from_memory(&bytes) {
                            return Some(img.to_rgba8());
                        }
                    }
                }
            }
        }
    }

    None
}

fn extract_youtube_id(url: &str) -> Option<String> {
    let trimmed = url.trim();
    if let Some(rest) = trimmed
        .strip_prefix("https://youtu.be/")
        .or_else(|| trimmed.strip_prefix("http://youtu.be/"))
    {
        return rest
            .split(['?', '/', '&'])
            .next()
            .map(|s| s.to_string())
            .filter(|s| !s.is_empty());
    }
    if trimmed.contains("youtube.com") {
        for segment in trimmed.split(['?', '&']) {
            if let Some(value) = segment.strip_prefix("v=") {
                return Some(value.to_string());
            }
        }
        if let Some(idx) = trimmed.find("/shorts/") {
            let after = &trimmed[idx + "/shorts/".len()..];
            return after
                .split(['/', '?', '&'])
                .next()
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty());
        }
    }
    None
}

// --- Theme (matches src/app/api/og/theme.ts) ---
const BG_COLOR: Rgba<u8> = Rgba([5, 5, 5, 255]);
const TEXT_COLOR: Rgba<u8> = Rgba([245, 245, 245, 255]);
const ACCENT_COLOR: Rgba<u8> = Rgba([0, 0, 255, 255]);
const SECONDARY_COLOR: Rgba<u8> = Rgba([255, 255, 255, 178]); // alpha 0.7
const SLUG_COLOR: Rgba<u8> = Rgba([51, 51, 51, 255]);
const TAG_BG_COLOR: Rgba<u8> = Rgba([255, 255, 255, 31]); // alpha 0.12

#[derive(Clone, Copy)]
enum Side {
    Left,
    Right,
}

fn render_og_image(
    entry: &EntryData,
    thumbnail: Option<&RgbaImage>,
) -> Result<Vec<u8>, image::ImageError> {
    let mut canvas: RgbaImage = ImageBuffer::from_pixel(WIDTH, HEIGHT, BG_COLOR);

    // Layer 1: faint grayscale background image
    if let Some(img) = thumbnail {
        draw_background_image(&mut canvas, img);
    }

    // Layer 2: rotated slugs along the left / right edges
    if !entry.slug.is_empty() {
        draw_rotated_slug(&mut canvas, &entry.slug, Side::Left);
        draw_rotated_slug(&mut canvas, &entry.slug, Side::Right);
    }

    // Layer 3: main content + right thumbnail
    draw_main_content(&mut canvas, entry, thumbnail);

    // Flatten alpha against the background color so the PNG renders the same
    // in every viewer (browsers, OG scrapers, social cards, etc.).
    let flat = flatten_against_bg(&canvas);

    let mut out = Vec::new();
    flat.write_to(
        &mut std::io::Cursor::new(&mut out),
        image::ImageFormat::Png,
    )?;
    Ok(out)
}

fn flatten_against_bg(src: &RgbaImage) -> image::RgbImage {
    let (w, h) = src.dimensions();
    let mut out = image::RgbImage::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let p = src.get_pixel(x, y);
            let a = p[3] as f32 / 255.0;
            let r = (p[0] as f32 * a + BG_COLOR[0] as f32 * (1.0 - a)) as u8;
            let g = (p[1] as f32 * a + BG_COLOR[1] as f32 * (1.0 - a)) as u8;
            let b = (p[2] as f32 * a + BG_COLOR[2] as f32 * (1.0 - a)) as u8;
            out.put_pixel(x, y, image::Rgb([r, g, b]));
        }
    }
    out
}

fn draw_background_image(canvas: &mut RgbaImage, img: &RgbaImage) {
    // Cover the canvas with a 1.2x-scaled copy, then crop centered.
    let target_w = (WIDTH as f32 * 1.2) as u32;
    let target_h = (HEIGHT as f32 * 1.2) as u32;
    let (sw, sh) = img.dimensions();
    let scale = (target_w as f32 / sw as f32).max(target_h as f32 / sh as f32);
    let resized = imageops::resize(
        img,
        (sw as f32 * scale).round() as u32,
        (sh as f32 * scale).round() as u32,
        FilterType::Triangle,
    );
    let (rw, rh) = resized.dimensions();
    let x = ((rw as i64 - WIDTH as i64) / 2).max(0) as u32;
    let y = ((rh as i64 - HEIGHT as i64) / 2).max(0) as u32;

    let opacity = 0.1_f32;
    for dy in 0..HEIGHT {
        for dx in 0..WIDTH {
            let p = resized.get_pixel(x + dx, y + dy);
            // ITU-R 601-2 luma transform.
            let gray =
                ((0.299 * p[0] as f32) + (0.587 * p[1] as f32) + (0.114 * p[2] as f32)) as u8;
            let bg = canvas.get_pixel(dx, dy);
            let r = (gray as f32 * opacity + bg[0] as f32 * (1.0 - opacity)) as u8;
            let g = (gray as f32 * opacity + bg[1] as f32 * (1.0 - opacity)) as u8;
            let b = (gray as f32 * opacity + bg[2] as f32 * (1.0 - opacity)) as u8;
            canvas.put_pixel(dx, dy, Rgba([r, g, b, 255]));
        }
    }
}

fn draw_rotated_slug(canvas: &mut RgbaImage, slug: &str, side: Side) {
    let scale = PxScale::from(14.0);
    let letter_spacing = 4.0_f32;
    let (text_w, text_h) = text_dimensions_with_spacing(slug, scale, letter_spacing);
    let pad_x: u32 = 8;
    let pad_y: u32 = 8;
    let total_w = text_w + pad_x * 2;
    let total_h = text_h + pad_y * 2;

    // Render text onto a temp image with horizontal layout.
    let mut buf: RgbaImage = ImageBuffer::from_pixel(total_w, total_h, BG_COLOR);
    draw_text_with_spacing(
        &mut buf,
        SLUG_COLOR,
        pad_x as i32,
        pad_y as i32,
        scale,
        letter_spacing,
        slug,
    );

    // Rotate 90° (counter-clockwise for Left, clockwise for Right).
    let rotated: RgbaImage = match side {
        Side::Left => imageops::rotate90(&buf),
        Side::Right => imageops::rotate270(&buf),
    };
    let (rw, rh) = rotated.dimensions();

    // Anchor at 20px from the relevant edge, vertically centered.
    let (px, py) = match side {
        Side::Left => {
            let px = 20_i64 - (rw as i64 / 2);
            let py = (HEIGHT as i64 / 2) - (rh as i64 / 2);
            (px, py)
        }
        Side::Right => {
            let px = WIDTH as i64 - 20 - (rw as i64 / 2);
            let py = (HEIGHT as i64 / 2) - (rh as i64 / 2);
            (px, py)
        }
    };
    let _ = text_w;

    overlay_rgba(canvas, &rotated, px, py);
}

fn draw_main_content(canvas: &mut RgbaImage, entry: &EntryData, thumbnail: Option<&RgbaImage>) {
    // Content area: padding 80px, gap 40px, right thumbnail 500x500.
    let content_x = CONTENT_PAD as i64;
    let content_y = CONTENT_PAD as i64;
    let right_w = THUMB_SIZE as i64;
    let left_w = (WIDTH as i64) - (CONTENT_PAD as i64) * 2 - right_w - CONTENT_GAP as i64;
    let content_h = (HEIGHT as i64) - (CONTENT_PAD as i64) * 2;

    // Title (top of left column).
    let title_top = content_y + 16; // mirrors top padding from original layout
    let title_height = draw_title(canvas, &entry.title, content_x, title_top, left_w);

    // Summary (under title, aligned with title text after blue border).
    let summary_top = title_top + title_height + 24;
    if !entry.summary.is_empty() {
        draw_summary(
            canvas,
            &entry.summary,
            content_x + SUMMARY_PAD as i64,
            summary_top,
            left_w - SUMMARY_PAD as i64,
        );
    }

    // Footer block anchored to bottom of left column.
    let footer_top = content_y + content_h - footer_height(entry);
    let footer_left = content_x;
    let footer_width = left_w;
    draw_footer(
        canvas,
        entry,
        footer_left,
        footer_top,
        footer_width,
    );

    // Right column: 500x500 thumbnail (cover) or empty placeholder.
    let thumb_x = content_x + left_w + CONTENT_GAP as i64;
    let thumb_y = content_y + (content_h - THUMB_SIZE as i64) / 2;
    if let Some(img) = thumbnail {
        draw_thumbnail(canvas, img, thumb_x, thumb_y, THUMB_SIZE);
    }
}

fn footer_height(entry: &EntryData) -> i64 {
    // tag row (~50px) + gap (20) + profile row (~80px)
    let _ = entry;
    50 + 20 + 80
}

fn draw_title(canvas: &mut RgbaImage, title: &str, x: i64, y: i64, max_w: i64) -> i64 {
    let scale = PxScale::from(56.0);
    let line_height = (56.0 * 1.2) as i32;
    let title_x = x + TITLE_BORDER_W as i64 + TITLE_PAD as i64;
    let max_chars_per_line = approx_chars_per_line("REEL 2025サンプル", 56.0, max_w);
    let lines = wrap_text(title, max_chars_per_line.max(8), max_w, 56.0);
    let taken: Vec<&str> = lines.iter().take(3).map(|s| s.as_str()).collect();
    let taken_len = taken.len() as i32;

    // Blue left border (12px solid).
    if taken_len > 0 {
        let border_rect = imageproc::rect::Rect::at(x as i32, y as i32)
            .of_size(TITLE_BORDER_W as u32, (taken_len * line_height) as u32);
        draw_filled_rect_mut(canvas, border_rect, ACCENT_COLOR);
    }

    let mut cursor_y = y as i32;
    for line in taken.iter() {
        draw_text_with_spacing(canvas, TEXT_COLOR, title_x as i32, cursor_y, scale, 0.0, line);
        cursor_y += line_height;
    }
    (taken_len * line_height) as i64
}

fn draw_summary(canvas: &mut RgbaImage, summary: &str, x: i64, y: i64, max_w: i64) -> i64 {
    let scale = PxScale::from(24.0);
    let line_height = (24.0 * 1.5) as i32;
    let lines = wrap_text(summary, 38, max_w, 24.0);
    let taken: Vec<&str> = lines.iter().take(2).map(|s| s.as_str()).collect();
    let mut cursor_y = y as i32;
    for line in taken.iter() {
        draw_text_with_spacing(canvas, SECONDARY_COLOR, x as i32, cursor_y, scale, 0.0, line);
        cursor_y += line_height;
    }
    (taken.len() as i32 * line_height) as i64
}

fn draw_footer(canvas: &mut RgbaImage, entry: &EntryData, x: i64, y: i64, max_w: i64) {
    // Top row: category box + tag chips.
    let mut chip_x = x as i32;
    let chip_y = y as i32;

    // Category: 22px, padding 8/16, 2px blue border.
    let cat_scale = PxScale::from(22.0);
    let (cat_text_w, cat_text_h) = text_dimensions(&entry.category, cat_scale);
    let cat_pad_x = 16;
    let cat_pad_y = 8;
    let cat_w = cat_text_w as i32 + cat_pad_x * 2;
    let cat_h = cat_text_h as i32 + cat_pad_y * 2;
    let cat_rect = imageproc::rect::Rect::at(chip_x, chip_y).of_size(cat_w as u32, cat_h as u32);
    draw_hollow_rect_mut(canvas, cat_rect, ACCENT_COLOR);
    draw_text_mut(
        canvas,
        TEXT_COLOR,
        chip_x + cat_pad_x,
        chip_y + cat_pad_y,
        cat_scale,
        font(),
        &entry.category,
    );
    chip_x += cat_w + 12;

    // Tag chips: 20px, padding 8/14, gray bg.
    let tag_scale = PxScale::from(20.0);
    for tag in entry.tags.iter().take(3) {
        let label = format!("#{tag}");
        let (tw, th) = text_dimensions(&label, tag_scale);
        let pad_x = 14;
        let pad_y = 8;
        let tw = tw as i32 + pad_x * 2;
        let th = th as i32 + pad_y * 2;
        if chip_x + tw > (x + max_w) as i32 {
            break;
        }
        let rect = imageproc::rect::Rect::at(chip_x, chip_y).of_size(tw as u32, th as u32);
        draw_filled_rect_mut(canvas, rect, TAG_BG_COLOR);
        draw_text_mut(
            canvas,
            SECONDARY_COLOR,
            chip_x + pad_x,
            chip_y + pad_y,
            tag_scale,
            font(),
            &label,
        );
        chip_x += tw + 12;
    }

    // Bottom row: avatar + brand + url.
    let profile_y = chip_y + cat_h.max(0) + 20;
    let avatar_size = 80_i32;
    let avatar_radius = avatar_size / 2;
    let avatar_cx = x as i32 + avatar_radius;
    let avatar_cy = profile_y + avatar_radius;
    draw_avatar(canvas, avatar_cx, avatar_cy, avatar_radius);

    // Brand column: samuido (32px) + URL (20px).
    let brand_x = avatar_cx + avatar_radius + 20;
    let brand_scale = PxScale::from(32.0);
    let (_bw, bh) = text_dimensions("samuido", brand_scale);
    draw_text_mut(
        canvas,
        TEXT_COLOR,
        brand_x,
        profile_y + (avatar_size - bh as i32) / 2,
        brand_scale,
        font(),
        "samuido",
    );
    let url_scale = PxScale::from(20.0);
    draw_text_mut(
        canvas,
        SECONDARY_COLOR,
        brand_x,
        profile_y + (avatar_size - bh as i32) / 2 + bh as i32 + 4,
        url_scale,
        font(),
        "https://yusuke-kim.com",
    );
    let _ = max_w;
}

fn draw_thumbnail(canvas: &mut RgbaImage, img: &RgbaImage, x: i64, y: i64, size: u32) {
    let (sw, sh) = img.dimensions();
    let scale = (size as f32 / sw as f32).max(size as f32 / sh as f32);
    let resized = imageops::resize(
        img,
        (sw as f32 * scale).round() as u32,
        (sh as f32 * scale).round() as u32,
        FilterType::Triangle,
    );
    let (rw, rh) = resized.dimensions();
    let ox = ((rw as i64 - size as i64) / 2).max(0) as u32;
    let oy = ((rh as i64 - size as i64) / 2).max(0) as u32;
    let crop = resized
        .view(ox, oy, size.min(rw), size.min(rh))
        .to_image();
    overlay_rgba(canvas, &crop, x, y);
}

fn draw_avatar(canvas: &mut RgbaImage, cx: i32, cy: i32, radius: i32) {
    let size = (radius * 2) as u32;
    let icon = avatar_icon();
    let (iw, ih) = icon.dimensions();
    let scale = (size as f32 / iw as f32).min(size as f32 / ih as f32);
    let resized = imageops::resize(
        icon,
        (iw as f32 * scale).round() as u32,
        (ih as f32 * scale).round() as u32,
        FilterType::Lanczos3,
    );
    let (rw, rh) = resized.dimensions();
    let ox = (rw as i32 - size as i32) / 2;
    let oy = (rh as i32 - size as i32) / 2;

    let top = cy - radius;
    let left = cx - radius;
    let r2 = (radius as f32) * (radius as f32);
    for dy in 0..size {
        for dx in 0..size {
            let px = dx as i32 + ox;
            let py = dy as i32 + oy;
            if px < 0 || py < 0 || px >= rw as i32 || py >= rh as i32 {
                continue;
            }
            let src = resized.get_pixel(px as u32, py as u32);
            // Circular mask: discard pixels outside the inscribed circle.
            let dx_c = dx as i32 - radius;
            let dy_c = dy as i32 - radius;
            if (dx_c * dx_c + dy_c * dy_c) as f32 > r2 {
                continue;
            }
            let tx = left + dx as i32;
            let ty = top + dy as i32;
            if tx < 0 || ty < 0 || tx >= WIDTH as i32 || ty >= HEIGHT as i32 {
                continue;
            }
            canvas.put_pixel(tx as u32, ty as u32, *src);
        }
    }
}

// --- Helpers ---

fn text_dimensions(text: &str, scale: PxScale) -> (u32, u32) {
    imageproc::drawing::text_size(scale, font(), text)
}

fn text_dimensions_with_spacing(text: &str, scale: PxScale, letter_spacing: f32) -> (u32, u32) {
    let (w, h) = text_dimensions(text, scale);
    if text.chars().count() <= 1 {
        return (w, h);
    }
    let extra = letter_spacing * (text.chars().count() as f32 - 1.0);
    ((w as f32 + extra) as u32, h)
}

fn draw_text_with_spacing(
    canvas: &mut RgbaImage,
    color: Rgba<u8>,
    x: i32,
    y: i32,
    scale: PxScale,
    letter_spacing: f32,
    text: &str,
) {
    let f = font();
    let scaled = f.as_scaled(scale);
    let mut cursor = x as f32;
    for ch in text.chars() {
        let gid = f.glyph_id(ch);
        let advance = scaled.h_advance(gid);
        draw_text_mut(canvas, color, cursor.round() as i32, y, scale, f, &ch.to_string());
        cursor += advance + letter_spacing;
    }
}

fn approx_chars_per_line(_text: &str, px_size: f32, max_w: i64) -> usize {
    let f = font();
    let scaled = f.as_scaled(PxScale::from(px_size));
    let avg_w = (scaled.h_advance(f.glyph_id('A')) + scaled.h_advance(f.glyph_id('a'))) / 2.0;
    let max_chars = (max_w as f32 / avg_w.max(1.0)).floor() as usize;
    max_chars.max(4)
}

fn wrap_text(text: &str, max_chars: usize, max_w: i64, px_size: f32) -> Vec<String> {
    let f = font();
    let scaled = f.as_scaled(PxScale::from(px_size));
    let max_width_px = max_w as f32;
    let mut lines: Vec<String> = Vec::new();
    let mut current = String::new();
    let mut current_width = 0.0_f32;

    for ch in text.chars() {
        let gid = f.glyph_id(ch);
        let advance = scaled.h_advance(gid);
        let next_width = current_width + advance;
        let next_chars = current.chars().count() + 1;
        if (next_width > max_width_px && !current.is_empty()) || next_chars > max_chars {
            lines.push(current.trim().to_string());
            current.clear();
            current_width = 0.0;
        }
        current.push(ch);
        current_width += advance;
    }
    if !current.trim().is_empty() {
        lines.push(current.trim().to_string());
    }
    if lines.is_empty() {
        lines.push(String::new());
    }
    lines
}

fn overlay_rgba(dst: &mut RgbaImage, src: &RgbaImage, x: i64, y: i64) {
    let (sw, sh) = src.dimensions();
    for dy in 0..sh as i64 {
        for dx in 0..sw as i64 {
            let sx = dx as u32;
            let sy = dy as u32;
            let tx = x + dx;
            let ty = y + dy;
            if tx < 0 || ty < 0 || tx >= WIDTH as i64 || ty >= HEIGHT as i64 {
                continue;
            }
            let sp = src.get_pixel(sx, sy);
            // Treat non-transparent pixels as opaque (background image source
            // is RGBA but background layer is fully opaque).
            if sp[3] == 0 {
                continue;
            }
            dst.put_pixel(tx as u32, ty as u32, *sp);
        }
    }
}

fn nonempty(value: String) -> String {
    if value.is_empty() {
        "Untitled".to_string()
    } else {
        value
    }
}
