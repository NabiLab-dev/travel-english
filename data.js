// 여행영어 50문장 데이터 (말틀 기반 구조)
// 문장 수정 후에는 tools/generate_audio.py 를 다시 실행해서 음원을 재생성하세요.
// 구조: 10개 핵심 말틀(PATTERNS) × 4개 여행 활용 문장(40) + 통째로 외우는 필수 표현 10개 = 50문장
// 같은 말틀이 연속으로 나오지 않도록 주차/순서를 일부러 섞었습니다 (상황을 바꿔가며 같은 말틀을 반복 노출).
const PROFILES = [
  { "id": "mom", "name": "엄마", "emoji": "👩🏻" },
  { "id": "dad", "name": "아빠", "emoji": "👨🏻" },
  { "id": "sib", "name": "동생", "emoji": "🧑🏻" }
];

const PATTERNS = [
  { "id": "p1",  "en": "I'd like",         "ko": "~ 주세요" },
  { "id": "p2",  "en": "Can I",            "ko": "제가 ~해도 될까요" },
  { "id": "p3",  "en": "Could you",        "ko": "~해 주시겠어요" },
  { "id": "p4",  "en": "Do you have",      "ko": "~ 있나요" },
  { "id": "p5",  "en": "Where is",         "ko": "~ 어디예요" },
  { "id": "p6",  "en": "How much is",      "ko": "~ 얼마예요" },
  { "id": "p7",  "en": "I need",           "ko": "~ 필요해요" },
  { "id": "p8",  "en": "I have",           "ko": "~ 있어요" },
  { "id": "p9",  "en": "I'm looking for",  "ko": "~ 찾고 있어요" },
  { "id": "p10", "en": "Is there",         "ko": "~ 있나요" }
];

const SENTENCES = [
  { "id": 1,  "week": 1, "cat": "인사", "situation": "누군가에게 말을 걸 때",
    "en": "Excuse me.", "ko": "실례합니다.",
    "chunks": ["Excuse me."] },

  { "id": 2,  "week": 1, "cat": "인사", "situation": "도움을 받았을 때",
    "en": "Thank you so much.", "ko": "정말 감사합니다.",
    "chunks": ["Thank you", "so much."] },

  { "id": 3,  "week": 1, "cat": "카페", "situation": "카페에서 주문할 때", "pattern": "p1", "patternIntro": true,
    "cue": { "en": "What would you like to drink?", "ko": "무엇을 드시겠어요?" },
    "en": "I'd like a coffee.", "ko": "커피 한 잔 주세요.",
    "chunks": ["I'd like", "a coffee."] },

  { "id": 4,  "week": 1, "cat": "공통", "situation": "화장실을 찾을 때", "pattern": "p5", "patternIntro": true,
    "en": "Where is the restroom?", "ko": "화장실이 어디예요?",
    "chunks": ["Where is", "the restroom?"] },

  { "id": 5,  "week": 1, "cat": "필수 표현", "situation": "말이 너무 빠를 때",
    "en": "Please speak slowly.", "ko": "천천히 말해 주세요.",
    "chunks": ["Please", "speak slowly."] },

  { "id": 6,  "week": 1, "cat": "필수 표현", "situation": "상대방 말을 놓쳤을 때",
    "en": "Could you say that again?", "ko": "다시 한번 말씀해 주시겠어요?",
    "chunks": ["Could you", "say that again?"] },

  { "id": 7,  "week": 1, "cat": "식당", "situation": "식당에서 물을 달라고 할 때", "pattern": "p1",
    "en": "I'd like some water.", "ko": "물 좀 주세요.",
    "chunks": ["I'd like", "some water."] },

  { "id": 8,  "week": 1, "cat": "필수 표현", "situation": "이해가 안 될 때",
    "en": "I don't understand.", "ko": "이해를 못 했어요.",
    "chunks": ["I don't", "understand."] },

  { "id": 9,  "week": 1, "cat": "교통", "situation": "지하철역을 찾을 때", "pattern": "p5",
    "en": "Where is the subway station?", "ko": "지하철역이 어디예요?",
    "chunks": ["Where is", "the subway station?"] },

  { "id": 10, "week": 2, "cat": "쇼핑", "situation": "물건을 가리키며 달라고 할 때", "pattern": "p2", "patternIntro": true,
    "en": "Can I have this?", "ko": "이거 주시겠어요?",
    "chunks": ["Can I", "have this?"] },

  { "id": 11, "week": 2, "cat": "호텔·카페", "situation": "와이파이가 있는지 물어볼 때", "pattern": "p4", "patternIntro": true,
    "en": "Do you have Wi-Fi?", "ko": "와이파이 있나요?",
    "chunks": ["Do you have", "Wi-Fi?"] },

  { "id": 12, "week": 2, "cat": "쇼핑", "situation": "물건을 고르며 살 때", "pattern": "p1",
    "en": "I'd like this one.", "ko": "이것으로 주세요.",
    "chunks": ["I'd like", "this one."] },

  { "id": 13, "week": 2, "cat": "쇼핑", "situation": "옷을 입어보고 싶을 때", "pattern": "p2",
    "en": "Can I try this on?", "ko": "이거 입어봐도 되나요?",
    "chunks": ["Can I", "try this on?"] },

  { "id": 14, "week": 2, "cat": "공항", "situation": "출구를 찾을 때", "pattern": "p5",
    "en": "Where is the exit?", "ko": "출구가 어디예요?",
    "chunks": ["Where is", "the exit?"] },

  { "id": 15, "week": 2, "cat": "쇼핑", "situation": "사이즈를 물어볼 때", "pattern": "p4",
    "en": "Do you have a bigger size?", "ko": "더 큰 사이즈 있나요?",
    "chunks": ["Do you have", "a bigger size?"] },

  { "id": 16, "week": 2, "cat": "호텔", "situation": "호텔 체크인 할 때", "pattern": "p8", "patternIntro": true,
    "cue": { "en": "Welcome! Do you have a reservation?", "ko": "어서 오세요! 예약하셨나요?" },
    "en": "I have a reservation.", "ko": "예약했어요.",
    "chunks": ["I have", "a reservation."] },

  { "id": 17, "week": 2, "cat": "식당", "situation": "메뉴판을 받고 싶을 때", "pattern": "p2",
    "en": "Can I see the menu?", "ko": "메뉴판 좀 볼 수 있을까요?",
    "chunks": ["Can I", "see the menu?"] },

  { "id": 18, "week": 2, "cat": "공항·기내", "situation": "좌석을 고를 때", "pattern": "p1",
    "en": "I'd like a window seat.", "ko": "창가 자리로 주세요.",
    "chunks": ["I'd like", "a window seat."] },

  { "id": 19, "week": 3, "cat": "관광", "situation": "사진을 부탁할 때", "pattern": "p3", "patternIntro": true,
    "en": "Could you take a picture of us?", "ko": "저희 사진 좀 찍어주시겠어요?",
    "chunks": ["Could you", "take a picture of us?"] },

  { "id": 20, "week": 3, "cat": "쇼핑", "situation": "가격을 물어볼 때", "pattern": "p6", "patternIntro": true,
    "en": "How much is this?", "ko": "이거 얼마예요?",
    "chunks": ["How much is", "this?"] },

  { "id": 21, "week": 3, "cat": "식당", "situation": "식당에 자리가 있는지 물어볼 때", "pattern": "p4",
    "cue": { "en": "How many people?", "ko": "몇 분이세요?" },
    "en": "Do you have a table for two?", "ko": "두 명 자리 있나요?",
    "chunks": ["Do you have", "a table for two?"] },

  { "id": 22, "week": 3, "cat": "쇼핑·식당", "situation": "결제할 때", "pattern": "p2",
    "en": "Can I pay by card?", "ko": "카드로 계산할 수 있나요?",
    "chunks": ["Can I", "pay by card?"] },

  { "id": 23, "week": 3, "cat": "병원·약국", "situation": "몸이 안 좋을 때", "pattern": "p8",
    "en": "I have a headache.", "ko": "머리가 아파요.",
    "chunks": ["I have", "a headache."] },

  { "id": 24, "week": 3, "cat": "쇼핑", "situation": "다른 물건 가격을 물어볼 때", "pattern": "p6",
    "en": "How much is that one?", "ko": "저건 얼마예요?",
    "chunks": ["How much is", "that one?"] },

  { "id": 25, "week": 3, "cat": "호텔", "situation": "짐을 맡기고 싶을 때", "pattern": "p3",
    "en": "Could you keep my luggage?", "ko": "짐 좀 보관해 주시겠어요?",
    "chunks": ["Could you", "keep my luggage?"] },

  { "id": 26, "week": 3, "cat": "공항", "situation": "탑승구를 찾을 때", "pattern": "p5",
    "en": "Where is gate ten?", "ko": "10번 게이트가 어디예요?",
    "chunks": ["Where is", "gate ten?"] },

  { "id": 27, "week": 3, "cat": "교통", "situation": "택시가 필요할 때", "pattern": "p7", "patternIntro": true,
    "en": "I need a taxi.", "ko": "택시가 필요해요.",
    "chunks": ["I need", "a taxi."] },

  { "id": 28, "week": 4, "cat": "교통", "situation": "표 값을 물어볼 때", "pattern": "p6",
    "en": "How much is a ticket?", "ko": "표 한 장에 얼마예요?",
    "chunks": ["How much is", "a ticket?"] },

  { "id": 29, "week": 4, "cat": "병원·약국", "situation": "약국을 찾을 때", "pattern": "p9", "patternIntro": true,
    "en": "I'm looking for a pharmacy.", "ko": "약국을 찾고 있어요.",
    "chunks": ["I'm looking for", "a pharmacy."] },

  { "id": 30, "week": 4, "cat": "식당", "situation": "메뉴 추천을 부탁할 때", "pattern": "p3",
    "en": "Could you recommend something good?", "ko": "맛있는 것 좀 추천해 주시겠어요?",
    "chunks": ["Could you", "recommend something good?"] },

  { "id": 31, "week": 4, "cat": "병원·약국", "situation": "의사가 필요할 때", "pattern": "p7",
    "en": "I need a doctor.", "ko": "의사가 필요해요.",
    "chunks": ["I need", "a doctor."] },

  { "id": 32, "week": 4, "cat": "공항", "situation": "짐 개수를 말할 때", "pattern": "p8",
    "en": "I have two bags.", "ko": "가방이 두 개예요.",
    "chunks": ["I have", "two bags."] },

  { "id": 33, "week": 4, "cat": "병원·약국", "situation": "두통약을 찾을 때", "pattern": "p4",
    "en": "Do you have something for a headache?", "ko": "두통약 있나요?",
    "chunks": ["Do you have", "something for a headache?"] },

  { "id": 34, "week": 4, "cat": "필수 표현", "situation": "말로 설명하기 어려울 때",
    "en": "Could you write it down, please?", "ko": "적어 주시겠어요?",
    "chunks": ["Could you write it down,", "please?"] },

  { "id": 35, "week": 4, "cat": "필수 표현", "situation": "위치를 말로 설명하기 어려울 때",
    "en": "Please show me on the map.", "ko": "지도에서 보여주세요.",
    "chunks": ["Please show me", "on the map."] },

  { "id": 36, "week": 4, "cat": "공통", "situation": "근처 시설이 있는지 물어볼 때", "pattern": "p10", "patternIntro": true,
    "en": "Is there a bathroom nearby?", "ko": "근처에 화장실 있나요?",
    "chunks": ["Is there", "a bathroom nearby?"] },

  { "id": 37, "week": 5, "cat": "길찾기", "situation": "호텔을 못 찾을 때", "pattern": "p9",
    "en": "I'm looking for my hotel.", "ko": "제 호텔을 찾고 있어요.",
    "chunks": ["I'm looking for", "my hotel."] },

  { "id": 38, "week": 5, "cat": "호텔", "situation": "숙박비를 물어볼 때", "pattern": "p6",
    "en": "How much is it per night?", "ko": "하룻밤에 얼마예요?",
    "chunks": ["How much is", "it per night?"] },

  { "id": 39, "week": 5, "cat": "쇼핑", "situation": "봉투가 필요할 때", "pattern": "p3",
    "cue": { "en": "Would you like a bag?", "ko": "봉투 필요하세요?" },
    "en": "Could you give me a bag?", "ko": "봉투 좀 주시겠어요?",
    "chunks": ["Could you", "give me a bag?"] },

  { "id": 40, "week": 5, "cat": "공통", "situation": "시간이 더 필요할 때", "pattern": "p7",
    "en": "I need more time.", "ko": "시간이 좀 더 필요해요.",
    "chunks": ["I need", "more time."] },

  { "id": 41, "week": 5, "cat": "공통", "situation": "현금인출기가 있는지 물어볼 때", "pattern": "p10",
    "en": "Is there an ATM here?", "ko": "여기 ATM 있나요?",
    "chunks": ["Is there", "an ATM here?"] },

  { "id": 42, "week": 5, "cat": "공통", "situation": "엘리베이터를 찾을 때", "pattern": "p9",
    "en": "I'm looking for the elevator.", "ko": "엘리베이터를 찾고 있어요.",
    "chunks": ["I'm looking for", "the elevator."] },

  { "id": 43, "week": 5, "cat": "긴급 상황", "situation": "급하게 도움이 필요할 때",
    "en": "I need help.", "ko": "도와주세요.",
    "chunks": ["I need", "help."] },

  { "id": 44, "week": 5, "cat": "긴급 상황", "situation": "짐이 안 나왔을 때",
    "en": "I can't find my luggage.", "ko": "제 짐을 못 찾겠어요.",
    "chunks": ["I can't find", "my luggage."] },

  { "id": 45, "week": 5, "cat": "쇼핑", "situation": "할인이 있는지 물어볼 때", "pattern": "p10",
    "en": "Is there a discount?", "ko": "할인 있나요?",
    "chunks": ["Is there", "a discount?"] },

  { "id": 46, "week": 5, "cat": "공통", "situation": "충전기가 필요할 때", "pattern": "p7",
    "en": "I need a charger.", "ko": "충전기가 필요해요.",
    "chunks": ["I need", "a charger."] },

  { "id": 47, "week": 5, "cat": "공통", "situation": "질문이 있을 때", "pattern": "p8",
    "en": "I have a question.", "ko": "질문 있어요.",
    "chunks": ["I have", "a question."] },

  { "id": 48, "week": 5, "cat": "식당", "situation": "맛집을 찾고 있을 때", "pattern": "p9",
    "en": "I'm looking for a good restaurant.", "ko": "맛있는 식당을 찾고 있어요.",
    "chunks": ["I'm looking for", "a good restaurant."] },

  { "id": 49, "week": 5, "cat": "긴급 상황", "situation": "택시가 급하게 필요할 때",
    "en": "Please call a taxi.", "ko": "택시 좀 불러주세요.",
    "chunks": ["Please call", "a taxi."] },

  { "id": 50, "week": 5, "cat": "교통", "situation": "공항 가는 버스가 있는지 물어볼 때", "pattern": "p10",
    "en": "Is there a bus to the airport?", "ko": "공항 가는 버스 있나요?",
    "chunks": ["Is there", "a bus to the airport?"] }
];

const WEEK_TITLES = {
  "1": "1주차 · 첫 인사와 카페·길찾기",
  "2": "2주차 · 부탁하기와 확인하기",
  "3": "3주차 · 값 물어보기와 예약",
  "4": "4주차 · 필요한 것 찾기",
  "5": "5주차 · 실전 확장과 대응"
};
