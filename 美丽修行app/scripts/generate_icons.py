"""Generate minimal tab bar icons for uni-app (81x81 PNG)."""
import struct
import zlib
import os

SIZE = 81
GRAY = (153, 153, 153)
PURPLE = (123, 94, 167)
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def png_chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)


def create_png(pixels):
    """pixels: list of (r,g,b,a) tuples, row-major SIZE*SIZE"""
    raw = b''
    for y in range(SIZE):
        raw += b'\x00'
        for x in range(SIZE):
            r, g, b, a = pixels[y * SIZE + x]
            raw += bytes([r, g, b, a])

    ihdr = struct.pack('>IIBBBBB', SIZE, SIZE, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', ihdr) + png_chunk(b'IDAT', zlib.compress(raw, 9)) + png_chunk(b'IEND', b'')


def blank():
    return [(0, 0, 0, 0)] * (SIZE * SIZE)


def set_pixel(pixels, x, y, color):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        pixels[y * SIZE + x] = color


def fill_rect(pixels, x0, y0, x1, y1, color):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            set_pixel(pixels, x, y, color)


def fill_circle(pixels, cx, cy, r, color):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2:
                set_pixel(pixels, x, y, color)


def stroke_circle(pixels, cx, cy, r, color, width=3):
    for y in range(cy - r - width, cy + r + width + 1):
        for x in range(cx - r - width, cx + r + width + 1):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if r - width <= d <= r + 1:
                set_pixel(pixels, x, y, color)


def draw_home(color):
    p = blank()
    fill_rect(p, 18, 42, 63, 66, color)
    for i in range(33):
        set_pixel(p, 40 - i, 42 - i, color)
        set_pixel(p, 41 + i, 42 - i, color)
    fill_rect(p, 36, 50, 45, 66, (255, 255, 255, 0))
    return p


def draw_discover(color):
    p = blank()
    stroke_circle(p, 40, 40, 22, color, 3)
    fill_circle(p, 58, 22, 6, color)
    return p


def draw_skin(color):
    p = blank()
    stroke_circle(p, 40, 38, 18, color, 3)
    fill_circle(p, 40, 38, 6, color)
    fill_rect(p, 28, 56, 52, 58, color)
    return p


def draw_box(color):
    p = blank()
    stroke_circle(p, 40, 40, 22, color, 3)
    fill_rect(p, 34, 36, 46, 44, color)
    return p


def draw_profile(color):
    p = blank()
    fill_circle(p, 40, 28, 12, color)
    stroke_circle(p, 40, 58, 18, color, 3)
    return p


ICONS = {
    'home': draw_home,
    'discover': draw_discover,
    'skin': draw_skin,
    'box': draw_box,
    'profile': draw_profile,
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'static', 'tabbar')
os.makedirs(OUTPUT_DIR, exist_ok=True)

for name, draw_fn in ICONS.items():
    gray_png = create_png(draw_fn((*GRAY, 255)))
    purple_png = create_png(draw_fn((*PURPLE, 255)))
    with open(os.path.join(OUTPUT_DIR, f'{name}.png'), 'wb') as f:
        f.write(gray_png)
    with open(os.path.join(OUTPUT_DIR, f'{name}-active.png'), 'wb') as f:
        f.write(purple_png)
    print(f'Created {name}.png and {name}-active.png')

print('Done!')
