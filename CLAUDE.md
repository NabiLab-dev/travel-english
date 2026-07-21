# 여행영어 프로젝트 지침

장년층용 여행영어 50문장 반복학습 웹앱. 서버·API 없이 정적 파일만으로 동작.

## ⚠️ 두 개의 버전이 있습니다 (수정 시 주의)
| 폴더 | 용도 | 저장소 / 주소 |
|---|---|---|
| `여행영어` (이 폴더) | **시어머님 문숙님 전용** — 개인화된 시작화면, 1인용 | [travel-english](https://github.com/NabiLab-dev/travel-english) · https://nabilab-dev.github.io/travel-english/ |
| `여행영어-배포용` | **공유용** — 사용자가 이름 직접 편집(최대 3명), 개인정보 없음 | [travel-english-app](https://github.com/NabiLab-dev/travel-english-app) · https://nabilab-dev.github.io/travel-english-app/ |

- 두 폴더는 **각각 독립된 git 저장소**입니다. 문장·음원·학습로직 등 공통 부분을 고치면 **양쪽 모두**에 반영해야 합니다
- 서로 다른 부분: `data.js`의 PROFILES/OWNER, `app.js`의 `showProfileSelect()`(+공유용의 `showProfileEdit()`), `index.html`/`manifest.json`의 제목, `style.css`의 시작화면 관련 부분
- **공유용에는 개인정보(문숙/최윤주/Amy 이름, CLAUDE.md, CHANGELOG.md)를 절대 넣지 말 것.** 커밋 전 grep으로 확인
- 개인용 시작화면 문구·이름은 `data.js`의 `OWNER` 객체에서 수정. 어머님 캐릭터 사진은 `img/munsook.png` (없으면 이모지로 자동 대체)

## 구조
- `index.html` / `style.css` / `app.js` — 앱 본체 (바닐라 JS, 빌드 없음)
- `data.js` — PATTERNS(말틀 10개) + SENTENCES(50문장) + PROFILES. 문장 수정은 여기서만
- `audio/` — sNN_normal.mp3(보통), sNN_slow.mp3(느리게) — Edge TTS로 생성
- `tools/generate_audio.py` — 음원 일괄 생성 (`pip install edge-tts` 필요, 이미 있는 파일은 건너뜀)
- `tools/generate_icons.py` — 홈 화면 아이콘 생성 (임시 아이콘, Amy가 캐릭터 이미지 주면 img/icon-*.png 교체)
- `manifest.json` / `sw.js` — PWA 설정 + 서비스워커 (안드로이드 "홈 화면에 추가" 네이티브 프롬프트, 오프라인 음원 재생)
- `문장목록.md` — 검토용 문장 목록 (data.js 수정 시 함께 갱신)
- `배포방법.md` — GitHub Pages 배포 절차

## 핵심 규칙
- **런타임 API 호출 금지** — 과금·버전오류 방지가 설계 원칙. 음원은 미리 생성해서 정적 파일로만 제공
- 진도/출석은 localStorage (기기별 저장, 서버 없음). 키: `travelEng_{profileId}`
- 문장 수정 시: data.js 수정 → 해당 mp3 삭제 → generate_audio.py 재실행
- UI는 장년층 기준: 큰 글씨, 큰 버튼, 한 화면에 한 가지만
- 간격 반복: 첫 학습 다음날 → 3일 → 7일 → 14일 → 30일 → 60일 (app.js INTERVALS)

## 말틀(패턴) 학습 구조 — 중요
- 50문장 = 10개 핵심 말틀(PATTERNS) × 4개 여행 활용문장(40) + 통째 암기 필수표현 10개
- 패턴 문장은 `chunks: [고정부, 교체부]` 2개로 고정 — 화면에서 고정부(주황)·교체부(파랑) 색 구분에 그대로 쓰임 (`sentenceEnHtml()`)
- 같은 말틀의 4개 활용문장은 SENTENCES 배열에서 절대 연속 배치하지 않음 — 상황을 바꿔가며 며칠에 걸쳐 재등장하도록 순서를 짬 (인지 부담 분산)
- `patternIntro: true`는 그 말틀이 처음 나오는 문장에만 표시 — 이때 같은 패턴의 나머지 3개 활용문장을 미리보기 칩으로 보여줌(`patternPreviewHtml()`). 재등장 시엔 "전에 배운 말틀이에요" 리마인드 태그만
- 복습 힌트는 SRS 레벨에 따라 점점 줄어듦(`hintTier()` in app.js): 처음(first)=한국어+말틀힌트 / 초반 복습(early, level 0~1)=한국어만 / 숙련 복습(late, level 3+)=상황만 보이고 한국어는 버튼으로 토글
- 새 말틀·문장을 추가할 때도 이 구조(고정부/교체부 분리, 인트로 미리보기, 힌트 단계)를 유지할 것

## 검토된 대안 (채택 안 함)
- PWA 홈 화면 추가 + 웹 푸시로 아침 알림: 기술적으로 가능하나 특정 시각(오전 10시) 발송에는 결국 무료 서버 트리거가 필요해 카톡 알림과 복잡도가 동일함 → 카톡 경로 하나로 확정

## 홈 화면 추가 (PWA)
- 안드로이드: 화면 하단 배너의 "추가하기" 버튼이 진짜 네이티브 설치 프롬프트를 띄움 (`beforeinstallprompt` 캡처)
- 아이폰(사파리): iOS는 자동 설치를 막아놔서 버튼 대신 "공유 → 홈 화면에 추가" 3단계 안내 팝업을 보여줌 (`showIOSInstallGuide()`)
- 배너는 이미 설치됐거나(`display-mode: standalone`) 사용자가 닫기(✕)를 누르면 다시 안 뜸 (localStorage `travelEng_installDismissed`)
- `sw.js`가 음원을 오프라인 캐싱함(한 번 들은 문장은 와이파이 없어도 재생) — 앱 화면(html/css/js)은 항상 최신을 우선 받아오고 오프라인일 때만 캐시 사용
- app.js/style.css를 고쳤는데 배포 후 반영이 안 되면 `sw.js`의 `CACHE_NAME` 숫자를 올릴 것 (예: v1 → v2)

## 커리큘럼 분량 (2026-07-20 결정)
- 하루 3문장씩 배우면 50문장은 약 17일이면 다 배움. 그 이후엔 새 문장 없이 간격 반복 복습만 영원히 반복됨(자유 복습으로 보충)
- Amy와 논의 후 "일단 50문장으로 시작 → 부모님 반응 보고 지루해하시면 그때 확장"으로 결정. 지금 미리 늘리지 않음
- 나중에 확장할 때 후보 경로 두 가지:
  1. 말틀당 활용문장을 4개→8개로 늘리기 (80~100문장, 기존 구조 그대로 재사용, 문장 30~50개 추가 작성 + 음원 재생성 필요)
  2. 새 문장 없이 기존 50문장을 조합한 "모의 여행 대화" 모드 추가 (공항→호텔→식당 상황을 이어붙인 미니 대화, 음원 새로 안 만들어도 됨)
- 확장 요청이 오면 이 섹션부터 참고할 것

## 예정 (2단계)
- 카톡 아침 10시 알림: 카카오 개발자 API + 가족 팀원 등록 + GitHub Actions (무료 경로)
- Amy 제작 캐릭터 이미지로 이모지 캐릭터 교체 (app.js `characterHtml()` 참고)
