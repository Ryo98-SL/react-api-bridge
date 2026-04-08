from math import atan2, cos, degrees, hypot, pi, radians, sin
from pathlib import Path
import struct
import zlib

W, H = 990, 527
PIXELS = bytearray(W * H * 4)

CENTER = (495.0, 264.0)
OUTER_NODES = [
    (362.0, 148.0),
    (628.0, 132.0),
    (704.0, 248.0),
    (602.0, 392.0),
    (495.0, 492.0),
    (294.0, 304.0),
]

CENTER_RADIUS = 28.0
OUTER_RADIUS = 13.0
CUP_RADIUS = 34.0
LINE_STOP = CUP_RADIUS

GLOW = (97, 218, 251)
GRADIENT_START = (139, 233, 255)
GRADIENT_END = (76, 199, 255)


def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return lo if value < lo else hi if value > hi else value


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_color(start: tuple[int, int, int], end: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(round(lerp(start[i], end[i], t))) for i in range(3))


def blend_px(x: int, y: int, color: tuple[int, int, int], alpha: float) -> None:
    if not (0 <= x < W and 0 <= y < H) or alpha <= 0:
        return

    index = (y * W + x) * 4
    sr, sg, sb = color
    sa = clamp(alpha)
    dr, dg, db = PIXELS[index], PIXELS[index + 1], PIXELS[index + 2]
    da = PIXELS[index + 3] / 255.0
    out_a = sa + da * (1.0 - sa)
    if out_a <= 0:
        return

    out_r = (sr * sa + dr * da * (1.0 - sa)) / out_a
    out_g = (sg * sa + dg * da * (1.0 - sa)) / out_a
    out_b = (sb * sa + db * da * (1.0 - sa)) / out_a

    PIXELS[index] = int(round(out_r))
    PIXELS[index + 1] = int(round(out_g))
    PIXELS[index + 2] = int(round(out_b))
    PIXELS[index + 3] = int(round(out_a * 255))


def draw_filled_circle(cx: float, cy: float, radius: float, color: tuple[int, int, int], alpha_scale: float = 1.0) -> None:
    aa = 1.2
    x0, x1 = max(0, int(cx - radius - 2)), min(W - 1, int(cx + radius + 2))
    y0, y1 = max(0, int(cy - radius - 2)), min(H - 1, int(cy + radius + 2))
    for y in range(y0, y1 + 1):
        py = y + 0.5
        for x in range(x0, x1 + 1):
            px = x + 0.5
            distance = hypot(px - cx, py - cy)
            if distance <= radius - aa:
                alpha = 1.0
            elif distance < radius + aa:
                alpha = (radius + aa - distance) / (2 * aa)
            else:
                continue
            blend_px(x, y, color, alpha * alpha_scale)


def draw_ring(cx: float, cy: float, outer_radius: float, inner_radius: float, color: tuple[int, int, int], alpha_scale: float = 1.0) -> None:
    aa = 1.2
    x0, x1 = max(0, int(cx - outer_radius - 2)), min(W - 1, int(cx + outer_radius + 2))
    y0, y1 = max(0, int(cy - outer_radius - 2)), min(H - 1, int(cy + outer_radius + 2))
    for y in range(y0, y1 + 1):
        py = y + 0.5
        for x in range(x0, x1 + 1):
            px = x + 0.5
            distance = hypot(px - cx, py - cy)
            if distance > outer_radius + aa or distance < inner_radius - aa:
                continue
            outer_alpha = 1.0 if distance <= outer_radius - aa else (outer_radius + aa - distance) / (2 * aa)
            inner_alpha = 0.0 if distance >= inner_radius + aa else (inner_radius + aa - distance) / (2 * aa)
            alpha = clamp(outer_alpha - inner_alpha)
            if alpha > 0:
                blend_px(x, y, color, alpha * alpha_scale)


def sample_line(start: tuple[float, float], end: tuple[float, float], steps: int) -> list[tuple[float, float]]:
    return [
        (lerp(start[0], end[0], index / steps), lerp(start[1], end[1], index / steps))
        for index in range(steps + 1)
    ]


def sample_cup(node: tuple[float, float]) -> list[tuple[float, float]]:
    dx = node[0] - CENTER[0]
    dy = node[1] - CENTER[1]
    direction = degrees(atan2(dy, dx))
    inward = direction + 180.0
    points: list[tuple[float, float]] = []
    steps = 120
    start = inward - 34.0
    end = inward + 34.0 - 360.0
    for index in range(steps + 1):
        angle = radians(start + (end - start) * (index / steps))
        x = node[0] + CUP_RADIUS * cos(angle)
        y = node[1] + CUP_RADIUS * sin(angle)
        points.append((x, y))
    return points


def line_end_for(node: tuple[float, float]) -> tuple[float, float]:
    dx = node[0] - CENTER[0]
    dy = node[1] - CENTER[1]
    distance = hypot(dx, dy)
    ux, uy = dx / distance, dy / distance
    return (node[0] - ux * LINE_STOP, node[1] - uy * LINE_STOP)


def draw_stroke(
    points: list[tuple[float, float]],
    width: float,
    start: tuple[int, int, int],
    end: tuple[int, int, int],
    alpha_scale: float = 1.0,
) -> None:
    radius = width / 2.0
    total = max(1, len(points) - 1)
    for index, (x, y) in enumerate(points):
        t = index / total
        color = lerp_color(start, end, t)
        draw_filled_circle(x, y, radius, color, alpha_scale)


def write_png(target: Path) -> None:
    raw = bytearray()
    stride = W * 4
    for y in range(H):
        raw.append(0)
        raw.extend(PIXELS[y * stride:(y + 1) * stride])

    compressed = zlib.compress(bytes(raw), 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)))
    png.extend(chunk(b"IDAT", compressed))
    png.extend(chunk(b"IEND", b""))
    target.write_bytes(png)


def main() -> None:
    for node in OUTER_NODES:
        line_points = sample_line(CENTER, line_end_for(node), 100)
        cup_points = sample_cup(node)

        draw_stroke(line_points, 14.0, GLOW, GLOW, 0.24)
        draw_stroke(cup_points, 14.0, GLOW, GLOW, 0.24)

        draw_stroke(line_points, 6.0, GRADIENT_START, GRADIENT_END)
        draw_stroke(cup_points, 6.0, GRADIENT_START, GRADIENT_END)

    draw_filled_circle(CENTER[0], CENTER[1], CENTER_RADIUS, GLOW)

    for node in OUTER_NODES:
        draw_ring(node[0], node[1], OUTER_RADIUS + 3.0, OUTER_RADIUS - 2.0, GLOW, 0.18)
        draw_ring(node[0], node[1], OUTER_RADIUS, OUTER_RADIUS - 5.0, GRADIENT_END)

    root = Path(__file__).resolve().parents[1]
    write_png(root / "logo" / "react-api-bridge-logo.png")
    write_png(root / "docs" / "public" / "react-api-bridge-logo.png")


if __name__ == "__main__":
    main()
