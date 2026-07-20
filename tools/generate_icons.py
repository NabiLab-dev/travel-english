# -*- coding: utf-8 -*-
"""홈 화면 아이콘 생성 (임시 아이콘 - Amy가 캐릭터 이미지를 주면 교체)
사용법: python tools/generate_icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img"
OUT.mkdir(exist_ok=True)

BG = (255, 138, 92)      # var(--accent)
BG_DARK = (240, 110, 60) # var(--accent-dark)
WHITE = (255, 255, 255)

def draw_suitcase(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.06)
    d.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), fill=BG)

    cx, cy = size / 2, size / 2
    body_w, body_h = size * 0.5, size * 0.38
    body = [cx - body_w / 2, cy - body_h / 2 + size * 0.04, cx + body_w / 2, cy + body_h / 2 + size * 0.04]
    d.rounded_rectangle(body, radius=int(size * 0.04), outline=WHITE, width=max(2, int(size * 0.03)))

    handle_w, handle_h = size * 0.22, size * 0.12
    handle = [cx - handle_w / 2, body[1] - handle_h, cx + handle_w / 2, body[1] + size * 0.02]
    d.rounded_rectangle(handle, radius=int(size * 0.03), outline=WHITE, width=max(2, int(size * 0.03)))

    line_y1 = body[1] + body_h * 0.33
    line_y2 = body[1] + body_h * 0.66
    d.line([body[0] + size * 0.03, line_y1, body[2] - size * 0.03, line_y1], fill=WHITE, width=max(2, int(size * 0.02)))
    d.line([body[0] + size * 0.03, line_y2, body[2] - size * 0.03, line_y2], fill=WHITE, width=max(2, int(size * 0.02)))
    return img

for size, name in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (48, "favicon.png")]:
    draw_suitcase(size).save(OUT / name)
    print("saved", name)

print("완료! Amy가 캐릭터 이미지를 주면 이 파일들을 교체하면 됩니다.")
