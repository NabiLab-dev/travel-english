# -*- coding: utf-8 -*-
"""여행영어 음원 일괄 생성 (Edge TTS, 무료)
사용법:  pip install edge-tts  후  python tools/generate_audio.py
data.js의 SENTENCES를 읽어 audio/sNN_normal.mp3, sNN_slow.mp3 를 생성한다.
이미 존재하는 파일은 건너뛴다. 문장을 수정했다면 해당 mp3를 지우고 다시 실행.
"""
import asyncio, json, re, sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
VOICE = "en-US-AriaNeural"
SLOW_RATE = "-35%"

def load_sentences():
    text = (ROOT / "data.js").read_text(encoding="utf-8")
    m = re.search(r"const SENTENCES = (\[.*?\]);", text, re.S)
    if not m:
        sys.exit("data.js에서 SENTENCES를 찾지 못했습니다.")
    return json.loads(m.group(1))

async def gen(text, path, rate):
    tts = edge_tts.Communicate(text, VOICE, rate=rate)
    await tts.save(str(path))
    print(f"  OK {path.name}")

async def main():
    out = ROOT / "audio"
    out.mkdir(exist_ok=True)
    sentences = load_sentences()
    for s in sentences:
        sid = f"s{s['id']:02d}"
        normal = out / f"{sid}_normal.mp3"
        slow = out / f"{sid}_slow.mp3"
        if not normal.exists():
            await gen(s["en"], normal, "+0%")
        if not slow.exists():
            # 의미 덩어리 사이에 쉼표를 넣어 끊어 읽기 유도
            slow_text = ", ".join(c.rstrip(",") for c in s["chunks"])
            await gen(slow_text, slow, SLOW_RATE)
    print("완료!")

if __name__ == "__main__":
    asyncio.run(main())
