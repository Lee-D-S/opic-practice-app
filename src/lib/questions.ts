import type {
  OPIcLevel,
  Question,
  CourseExperience,
  ResidenceType,
  SchoolStatus,
  SurveyTag,
  WorkField,
  WorkStatus,
} from "./types";

export const surveyOptions: {
  tag: SurveyTag;
  label: string;
  basis: "official-broad" | "app-practice";
}[] = [
  { tag: "home", label: "집/거주", basis: "official-broad" },
  { tag: "work", label: "직장", basis: "official-broad" },
  { tag: "school", label: "학교", basis: "official-broad" },
  { tag: "movie", label: "영화", basis: "app-practice" },
  { tag: "music", label: "음악", basis: "app-practice" },
  { tag: "travel", label: "여행", basis: "app-practice" },
  { tag: "exercise", label: "운동", basis: "app-practice" },
  { tag: "food", label: "음식/카페", basis: "app-practice" },
  { tag: "shopping", label: "쇼핑", basis: "app-practice" },
  { tag: "technology", label: "기술", basis: "app-practice" },
  { tag: "health", label: "건강", basis: "app-practice" },
];

export const workFieldOptions: { value: WorkField; label: string }[] = [
  { value: "business", label: "Business / Corporation" },
  { value: "home_business", label: "Home Business" },
  { value: "teacher", label: "Teacher / Educator" },
  { value: "no_work_experience", label: "No work experience" },
];

export const workStatusOptions: { value: WorkStatus; label: string }[] = [
  { value: "working", label: "Yes" },
  { value: "not_working", label: "No" },
];

export const schoolStatusOptions: { value: SchoolStatus; label: string }[] = [
  { value: "student", label: "Yes" },
  { value: "not_student", label: "No" },
];

export const courseExperienceOptions: { value: CourseExperience; label: string }[] = [
  { value: "degree_course", label: "학위 과정 수업" },
  { value: "professional_development", label: "전문 기술 향상을 위한 평생 학습" },
  { value: "language_class", label: "어학수업" },
  { value: "over_five_years", label: "수강 후 5년 이상 지남" },
];

export const residenceOptions: { value: ResidenceType; label: string }[] = [
  { value: "alone", label: "개인주택이나 아파트에 홀로 거주" },
  { value: "non_family", label: "친구나 룸메이트와 함께 주택이나 아파트에 거주" },
  { value: "family", label: "가족과 함께 주택이나 아파트에 거주" },
  { value: "dormitory", label: "학교 기숙사" },
  { value: "military_barracks", label: "군대 막사" },
];

export const backgroundSurveySections: {
  id: string;
  title: string;
  prompt: string;
  minimum: number;
  optionKey: "leisureIds" | "hobbyIds" | "sportIds" | "travelIds";
  options: { id: string; label: string; tag?: SurveyTag }[];
}[] = [
  {
    id: "leisure",
    title: "여가 활동",
    prompt: "귀하는 여가 활동으로 주로 무엇을 하십니까? (두 개 이상 선택)",
    minimum: 2,
    optionKey: "leisureIds",
    options: [
      { id: "movies", label: "영화보기", tag: "movie" },
      { id: "clubs", label: "클럽/나이트클럽 가기" },
      { id: "performances", label: "공연보기", tag: "music" },
      { id: "concerts", label: "콘서트보기", tag: "music" },
      { id: "museums", label: "박물관가기" },
      { id: "parks", label: "공원가기", tag: "health" },
      { id: "camping", label: "캠핑하기", tag: "travel" },
      { id: "beach", label: "해변가기", tag: "travel" },
      { id: "watching_sports", label: "스포츠 관람", tag: "exercise" },
      { id: "home_improvement", label: "주거 개선", tag: "home" },
    ],
  },
  {
    id: "hobbies",
    title: "취미와 관심사",
    prompt: "귀하의 취미나 관심사는 무엇입니까? (한 개 이상 선택)",
    minimum: 1,
    optionKey: "hobbyIds",
    options: [
      { id: "reading_children", label: "아이에게 책 읽어주기" },
      { id: "listening_music", label: "음악 감상하기", tag: "music" },
      { id: "instruments", label: "악기 연주하기", tag: "music" },
      { id: "singing", label: "혼자 노래부르거나 합창하기", tag: "music" },
      { id: "dancing", label: "춤추기", tag: "exercise" },
      { id: "writing", label: "글쓰기(편지, 단문, 시 등)" },
      { id: "drawing", label: "그림 그리기" },
      { id: "cooking", label: "요리하기", tag: "food" },
      { id: "pets", label: "애완동물 기르기", tag: "home" },
    ],
  },
  {
    id: "sports",
    title: "운동",
    prompt: "귀하는 주로 어떤 운동을 즐기십니까? (한 개 이상 선택)",
    minimum: 1,
    optionKey: "sportIds",
    options: [
      "농구", "야구/소프트볼", "축구", "미식축구", "하키", "크리켓", "골프", "배구", "테니스", "배드민턴", "탁구", "수영", "자전거", "스키/스노우보드", "아이스 스케이트", "조깅", "걷기", "요가", "하이킹/트레킹", "낚시", "헬스",
    ].map((label) => ({ id: label, label, tag: "exercise" as SurveyTag })).concat([
      { id: "no_exercise", label: "운동을 전혀 하지 않음", tag: "health" },
    ]),
  },
  {
    id: "travel",
    title: "휴가와 출장",
    prompt: "귀하는 어떤 휴가나 출장을 다녀온 경험이 있습니까? (한 개 이상 선택)",
    minimum: 1,
    optionKey: "travelIds",
    options: [
      { id: "domestic_business", label: "국내출장", tag: "work" },
      { id: "overseas_business", label: "해외출장", tag: "work" },
      { id: "staycation", label: "집에서 보내는 휴가", tag: "home" },
      { id: "domestic_travel", label: "국내 여행", tag: "travel" },
      { id: "overseas_travel", label: "해외 여행", tag: "travel" },
    ],
  },
];

export const selfAssessmentOptions: { value: 1 | 2 | 3 | 4 | 5 | 6; label: string }[] = [
  { value: 1, label: "나는 10단어 이하의 단어로 말할 수 있습니다." },
  { value: 2, label: "나는 기본적인 물건, 색깔, 요일, 음식, 의류, 숫자 등을 말할 수 있습니다. 완벽한 문장을 항상 구사하지는 못합니다." },
  { value: 3, label: "나는 나 자신, 직장, 친숙한 사람과 장소, 일상에 대한 기본적인 정보를 간단한 문장으로 전달할 수 있습니다." },
  { value: 4, label: "나는 나 자신, 일상, 일/학교, 취미에 대해 간단한 대화를 할 수 있고 필요한 것을 얻기 위한 질문도 할 수 있습니다." },
  { value: 5, label: "나는 친숙한 주제와 가정, 일/학교, 개인 및 사회적 관심사에 대해 연결된 문장으로 말할 수 있습니다." },
  { value: 6, label: "나는 일/학교, 개인적인 관심사, 시사 문제에 대한 대화나 토론에 자신 있게 참여할 수 있습니다." },
];

export const levelDescriptions: Record<OPIcLevel, string> = {
  IM1: "짧은 문장으로 경험을 설명하고 40-60초 답변을 안정화합니다.",
  IM2: "이유와 예시를 붙여 60-90초 답변 구조를 만듭니다.",
  IH: "돌발 질문과 과거 경험을 90-120초로 자연스럽게 전개합니다.",
  AL: "복합 주제와 추상 의견을 디테일한 스토리로 설득력 있게 말합니다.",
};

export const questions: Question[] = [
  {
    id: "im1-movie-routine-1",
    level: "IM1",
    type: "routine",
    topic: "movie",
    surveyTags: ["movie"],
    prompt: "Tell me about the kinds of movies you usually watch. Why do you like them?",
    followUpGroupId: "movie-basic",
    difficulty: 1,
    prepTimeSec: 30,
    answerTimeSec: 60,
    evaluationFocus: ["좋아하는 영화 종류", "간단한 이유", "현재 시제"],
    sampleAnswer:
      "I usually watch comedy movies because they help me relax. I often watch them at home on weekends. My favorite part is that I can laugh and forget about stress for a while.",
    usefulExpressions: ["I usually watch...", "They help me relax.", "My favorite part is..."],
  },
  {
    id: "im1-food-description-1",
    level: "IM1",
    type: "description",
    topic: "food",
    surveyTags: ["food"],
    prompt: "Describe a restaurant or cafe you like. What is it like?",
    difficulty: 1,
    prepTimeSec: 30,
    answerTimeSec: 60,
    evaluationFocus: ["장소 묘사", "좋아하는 이유", "기본 형용사"],
    sampleAnswer:
      "There is a small cafe near my home. It is quiet and clean. I like it because the coffee is good and the staff are friendly.",
    usefulExpressions: ["There is a...", "It is quiet and clean.", "I like it because..."],
  },
  {
    id: "im2-travel-experience-1",
    level: "IM2",
    type: "experience",
    topic: "travel",
    surveyTags: ["travel"],
    prompt: "Tell me about a memorable trip you took recently. What happened, and why was it memorable?",
    followUpGroupId: "travel-memory",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["과거 경험", "시간 순서", "기억에 남는 이유"],
    sampleAnswer:
      "Last winter, I went to Busan with two friends. We planned to visit famous restaurants, but it rained heavily on the first day. At first, I was disappointed, but we found a small seafood place by chance. The food was amazing, and we talked for hours. That unexpected moment made the trip memorable.",
    usefulExpressions: ["Last winter, I went to...", "At first, I was disappointed.", "That unexpected moment made it memorable."],
  },
  {
    id: "im2-home-comparison-1",
    level: "IM2",
    type: "comparison",
    topic: "home",
    surveyTags: ["home"],
    prompt: "Compare your home now with the place where you lived before. What has changed?",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["비교 구조", "이전/현재 시제", "구체적 변화"],
    sampleAnswer:
      "My current home is much quieter than my old place. Before, I lived near a busy road, so it was noisy even at night. Now I live in a residential area, and I can sleep better. The biggest change is that I feel more relaxed at home.",
    usefulExpressions: ["Compared with my old place...", "The biggest change is...", "I feel more relaxed now."],
  },
  {
    id: "ih-work-problem-1",
    level: "IH",
    type: "problem_solving",
    topic: "work",
    surveyTags: ["work", "school"],
    prompt: "Tell me about a problem you had at work or school. How did you handle it?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["문제 상황", "해결 과정", "결과와 배운 점"],
    sampleAnswer:
      "A few months ago, I had a deadline conflict at work. Two tasks became urgent at the same time, and I knew I could not finish both without help. I first listed the tasks by priority and talked to my manager. Then I asked a coworker to review one part while I focused on the client report. In the end, we met the deadline, and I learned that communicating early is better than struggling alone.",
    usefulExpressions: ["A few months ago...", "I knew I could not...", "In the end...", "I learned that..."],
  },
  {
    id: "ih-technology-unexpected-1",
    level: "IH",
    type: "unexpected",
    topic: "technology",
    surveyTags: ["technology"],
    prompt: "How has technology changed the way people communicate? Give specific examples.",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["일반 의견", "구체 예시", "장단점 균형"],
    sampleAnswer:
      "Technology has made communication faster and more visual. For example, instead of calling someone, many people now send short messages, photos, or voice notes. This is convenient because we can respond whenever we have time. However, it can also make conversations feel less personal. So I think technology helps us stay connected, but we still need face-to-face conversations for important topics.",
    usefulExpressions: ["Technology has made...", "This is convenient because...", "However, it can also...", "I still think..."],
  },
  {
    id: "al-health-opinion-1",
    level: "AL",
    type: "unexpected",
    topic: "health",
    surveyTags: ["health", "exercise"],
    prompt: "Some people say modern life makes it harder to stay healthy. To what extent do you agree?",
    difficulty: 4,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["추상 의견", "균형 잡힌 논리", "구체 사례"],
    sampleAnswer:
      "I mostly agree, but I think the issue is not modern life itself. It is the way we manage convenience. Food delivery, desk jobs, and constant screen time make it easy to move less and eat poorly. At the same time, modern tools also give us fitness apps, health data, and access to better information. So the real challenge is self-management. People have more options than before, but they also need stronger habits to use those options well.",
    usefulExpressions: ["I mostly agree, but...", "The issue is not...", "At the same time...", "The real challenge is..."],
  },
  {
    id: "al-travel-roleplay-1",
    level: "AL",
    type: "roleplay",
    topic: "travel",
    surveyTags: ["travel"],
    prompt: "You booked a hotel room, but the room is not what you expected. Call the front desk and explain the problem. Ask for two possible solutions.",
    difficulty: 4,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["상황 설명", "정중한 요청", "대안 제시"],
    sampleAnswer:
      "Hello, I just checked into my room, and I think there may have been a mistake with my reservation. I booked a quiet non-smoking room, but this room smells like smoke and faces a noisy street. Could you check if another room is available? If that is not possible, I would appreciate a room change tomorrow and some kind of discount for tonight.",
    usefulExpressions: ["There may have been a mistake...", "Could you check if...", "If that is not possible...", "I would appreciate..."],
  },
  {
    id: "im2-movie-description-1",
    level: "IM2",
    type: "description",
    topic: "movie",
    surveyTags: ["movie"],
    prompt: "Describe the place where you usually watch movies. What is it like, and why do you like watching movies there?",
    followUpGroupId: "movie-place",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["장소 묘사", "좋아하는 이유", "구체적 세부 정보"],
    sampleAnswer:
      "I usually watch movies in my living room because it is comfortable and quiet. I turn off the lights, sit on the sofa, and use a small speaker. It feels almost like a small theater at home, so I can focus on the movie without spending extra money.",
    usefulExpressions: ["I usually watch movies in...", "It feels almost like...", "I can focus on..."],
  },
  {
    id: "im2-music-routine-1",
    level: "IM2",
    type: "routine",
    topic: "music",
    surveyTags: ["music"],
    prompt: "Tell me about when and how you usually listen to music. What kind of music do you listen to most often?",
    followUpGroupId: "music-routine",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["루틴 설명", "빈도 표현", "취향 이유"],
    sampleAnswer:
      "I usually listen to music when I commute or work out. In the morning, I prefer calm pop music because it helps me start the day slowly. But when I exercise, I listen to faster songs because they give me more energy.",
    usefulExpressions: ["I usually listen to music when...", "I prefer...", "They give me more energy."],
  },
  {
    id: "im2-food-experience-1",
    level: "IM2",
    type: "experience",
    topic: "food",
    surveyTags: ["food"],
    prompt: "Tell me about a memorable meal you had recently. Who were you with, and what made it memorable?",
    followUpGroupId: "food-memory",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["최근 경험", "사람/장소", "기억에 남는 이유"],
    sampleAnswer:
      "Last month, I had dinner with my old friends at a small Korean barbecue restaurant. We had not met for a long time, so we talked about our jobs and old memories. The food was good, but the best part was spending time together again.",
    usefulExpressions: ["Last month, I had...", "We had not met for...", "The best part was..."],
  },
  {
    id: "im2-shopping-problem-1",
    level: "IM2",
    type: "problem_solving",
    topic: "shopping",
    surveyTags: ["shopping"],
    prompt: "Tell me about a problem you had while shopping. What was the problem, and how did you solve it?",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["문제 상황", "해결 행동", "결과"],
    sampleAnswer:
      "A few weeks ago, I ordered a jacket online, but the size was too small. I checked the return policy and contacted customer service. They helped me exchange it for a larger size. It took a few days, but I was happy with the final result.",
    usefulExpressions: ["A few weeks ago...", "I checked the return policy.", "I was happy with the final result."],
  },
  {
    id: "im2-exercise-comparison-1",
    level: "IM2",
    type: "comparison",
    topic: "exercise",
    surveyTags: ["exercise", "health"],
    prompt: "Compare how you exercised in the past with how you exercise now. What has changed?",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["과거/현재 비교", "변화 이유", "현재 습관"],
    sampleAnswer:
      "In the past, I did not exercise regularly. I only played sports with friends once in a while. These days, I try to walk every evening because it is easier to keep doing. The biggest change is that I care more about my health now.",
    usefulExpressions: ["In the past, I did not...", "These days, I try to...", "The biggest change is..."],
  },
  {
    id: "im2-technology-routine-1",
    level: "IM2",
    type: "routine",
    topic: "technology",
    surveyTags: ["technology"],
    prompt: "What technology do you use every day? Explain how it helps you in your daily life.",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["일상 도구", "사용 방식", "도움이 되는 이유"],
    sampleAnswer:
      "I use my smartphone every day. I check messages, manage my schedule, and listen to music with it. It helps me save time because I can do many things in one place. I especially use map apps when I go somewhere new.",
    usefulExpressions: ["I use my smartphone to...", "It helps me save time.", "I especially use..."],
  },
  {
    id: "im2-home-experience-1",
    level: "IM2",
    type: "experience",
    topic: "home",
    surveyTags: ["home"],
    prompt: "Tell me about a time when you changed something in your home. What did you change, and why?",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["집 관련 경험", "변화 내용", "이유"],
    sampleAnswer:
      "Recently, I changed the layout of my room. My desk was too close to my bed, so I could not focus well. I moved the desk near the window and added a small lamp. Now the room feels cleaner, and it is easier to study there.",
    usefulExpressions: ["Recently, I changed...", "It was too close to...", "Now it feels..."],
  },
  {
    id: "im2-travel-roleplay-1",
    level: "IM2",
    type: "roleplay",
    topic: "travel",
    surveyTags: ["travel"],
    prompt: "Role-play: You are calling a hotel to ask about a room. Ask about the price, location, and check-in time.",
    difficulty: 2,
    prepTimeSec: 30,
    answerTimeSec: 90,
    evaluationFocus: ["질문하기", "정중한 표현", "필수 정보 확인"],
    sampleAnswer:
      "Hello, I am planning to stay at your hotel next weekend. Could you tell me how much a standard room is? Also, I would like to know how far it is from the train station. Finally, what time can I check in?",
    usefulExpressions: ["Could you tell me...", "I would like to know...", "What time can I...?"],
  },
  {
    id: "ih-movie-comparison-1",
    level: "IH",
    type: "comparison",
    topic: "movie",
    surveyTags: ["movie", "technology"],
    prompt: "Compare watching movies in theaters with watching them through streaming services. What are the advantages and disadvantages of each?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["비교", "장단점", "균형 있는 설명"],
    sampleAnswer:
      "Watching movies in theaters feels more immersive because the screen and sound are much better. It is also a special activity, so people tend to focus more. On the other hand, streaming is cheaper and more convenient. You can pause the movie, watch it at home, and choose from many options. Personally, I use streaming most of the time, but I still go to theaters for movies that need a bigger screen.",
    usefulExpressions: ["It feels more immersive because...", "On the other hand...", "Personally, I..."],
  },
  {
    id: "ih-work-experience-1",
    level: "IH",
    type: "experience",
    topic: "work",
    surveyTags: ["work", "school"],
    prompt: "Tell me about a time when you had to work with someone who had a different opinion. What happened, and how did you respond?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["갈등 경험", "대응 방식", "결과"],
    sampleAnswer:
      "Last year, I worked on a project with a teammate who wanted to move much faster than I did. I thought we needed more time to check the details, so we disagreed several times. Instead of arguing, I suggested that we divide the work into urgent tasks and review tasks. That helped us finish quickly without missing important points.",
    usefulExpressions: ["We disagreed several times.", "Instead of arguing...", "That helped us..."],
  },
  {
    id: "ih-health-opinion-1",
    level: "IH",
    type: "unexpected",
    topic: "health",
    surveyTags: ["health", "exercise"],
    prompt: "Do you think people today are more interested in health than people in the past? Explain your opinion with examples.",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["의견 제시", "과거/현재 비교", "예시"],
    sampleAnswer:
      "I think people are more interested in health today because information is much easier to access. Many people use fitness apps, watch health videos, and check nutrition labels. In the past, people were active in daily life, but they did not always track their health intentionally. Today, the problem is that people have more information but also more stress and screen time.",
    usefulExpressions: ["I think people are more...", "In the past...", "The problem is that..."],
  },
  {
    id: "ih-technology-problem-1",
    level: "IH",
    type: "problem_solving",
    topic: "technology",
    surveyTags: ["technology"],
    prompt: "Tell me about a time when technology caused a problem for you. How did you solve it?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["기술 문제", "해결 과정", "교훈"],
    sampleAnswer:
      "A few months ago, my laptop suddenly stopped working before an online meeting. At first, I panicked because I had all my notes there. I quickly joined the meeting on my phone and explained the situation. After the meeting, I backed up my files to cloud storage. Since then, I have tried not to depend on only one device.",
    usefulExpressions: ["At first, I panicked because...", "I quickly...", "Since then, I have tried..."],
  },
  {
    id: "ih-travel-unexpected-1",
    level: "IH",
    type: "unexpected",
    topic: "travel",
    surveyTags: ["travel"],
    prompt: "Some people prefer planned trips, while others prefer spontaneous trips. Which do you prefer, and why?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["선호 설명", "이유", "구체 예시"],
    sampleAnswer:
      "I prefer planned trips because they help me use my time better. When I travel, I usually have only a few days, so I do not want to waste time deciding where to go. However, I do leave some free time in the schedule because unexpected places can be memorable. For example, on my last trip, I found a small local market that was not in my plan, and it became one of my favorite memories.",
    usefulExpressions: ["I prefer planned trips because...", "However, I do leave...", "It became one of my favorite memories."],
  },
  {
    id: "ih-food-roleplay-1",
    level: "IH",
    type: "roleplay",
    topic: "food",
    surveyTags: ["food"],
    prompt: "Role-play: You made a restaurant reservation, but you need to change it. Call the restaurant, explain the situation, and ask for a new time.",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["상황 설명", "정중한 요청", "대안 협상"],
    sampleAnswer:
      "Hello, I made a reservation for four people at seven tonight, but something unexpected came up. Would it be possible to move the reservation to eight thirty? If that time is not available, could you check any other openings after eight? I am sorry for the short notice.",
    usefulExpressions: ["Something unexpected came up.", "Would it be possible to...", "I am sorry for the short notice."],
  },
  {
    id: "ih-shopping-comparison-1",
    level: "IH",
    type: "comparison",
    topic: "shopping",
    surveyTags: ["shopping", "technology"],
    prompt: "Compare online shopping and shopping in physical stores. How have people's shopping habits changed?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["비교", "사회 변화", "장단점"],
    sampleAnswer:
      "Online shopping has changed people's habits a lot. It is convenient because people can compare prices quickly and buy things anytime. But physical stores still have value because customers can see and try products before buying them. I think people now use both methods depending on what they need. For simple products, they shop online, but for clothes or expensive items, many people still prefer stores.",
    usefulExpressions: ["It has changed people's habits...", "still have value because...", "depending on what they need"],
  },
  {
    id: "ih-home-problem-1",
    level: "IH",
    type: "problem_solving",
    topic: "home",
    surveyTags: ["home"],
    prompt: "Tell me about a problem you had at home, such as noise, repairs, or space. What did you do about it?",
    difficulty: 3,
    prepTimeSec: 30,
    answerTimeSec: 120,
    evaluationFocus: ["생활 문제", "해결 과정", "결과"],
    sampleAnswer:
      "Last summer, there was a serious noise problem in my building because of construction next door. I could not concentrate when I worked from home. First, I talked to the building manager to check the schedule. Then I changed my working hours and used a nearby cafe in the morning. It was inconvenient, but planning around the noise helped me reduce stress.",
    usefulExpressions: ["There was a serious problem with...", "First, I talked to...", "Planning around it helped me..."],
  },
];

export function recommendQuestion(
  level: OPIcLevel,
  selectedTags: SurveyTag[],
  completedQuestionIds: string[],
): Question {
  const candidates = questions.filter((question) => question.level === level);
  const surveyMatched = candidates.filter((question) =>
    question.surveyTags.some((tag) => selectedTags.includes(tag)),
  );
  const pool = surveyMatched.length > 0 ? surveyMatched : candidates;
  const fresh = pool.find((question) => !completedQuestionIds.includes(question.id));

  return fresh ?? pool[0] ?? questions[0];
}

export function buildMockExamQuestions(
  level: OPIcLevel,
  selectedTags: SurveyTag[],
): Question[] {
  const fallbackTags: SurveyTag[] = ["movie", "travel", "food"];
  const tags: SurveyTag[] = selectedTags.length > 0 ? selectedTags : fallbackTags;
  const topicA = tags[0];
  const topicB = tags[1] ?? tags[0];
  const topicC = tags[2] ?? "technology";
  const answerTimeSec = level === "IM1" ? 60 : level === "IM2" ? 90 : 120;
  const difficulty = level === "IM1" ? 1 : level === "IM2" ? 2 : level === "IH" ? 3 : 4;

  return [
    makeMockQuestion(level, "mock-01-warmup-self-intro", "self_intro", "self", ["home"], "Warm-up: Tell me something about yourself. This first response is treated as non-rated practice in this app.", ["워밍업", "자기소개", "비채점 연습"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-02-home-description", "description", "home", ["home"], "Describe the place where you live. What does it look like, and what do you like about it?", ["장소 묘사", "세부 정보", "좋아하는 이유"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-03-topic-a-routine", "routine", topicA, [topicA], `You said you are interested in ${topicA}. Tell me what you usually do related to this topic.`, ["루틴 설명", "빈도 표현", "이유"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-04-topic-a-experience", "experience", topicA, [topicA], `Tell me about a memorable experience you had related to ${topicA}. What happened?`, ["과거 경험", "시간 순서", "기억에 남는 이유"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-05-topic-a-comparison", "comparison", topicA, [topicA], `How has your interest in ${topicA} changed over time? Compare the past and now.`, ["과거/현재 비교", "변화", "구체 예시"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-06-topic-b-description", "description", topicB, [topicB], `Describe a place or situation connected to ${topicB}. What is it like?`, ["묘사", "장소/상황", "구체성"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-07-topic-b-experience", "experience", topicB, [topicB], `Tell me about the last time you did something related to ${topicB}.`, ["최근 경험", "행동 순서", "감정"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-08-topic-b-problem", "problem_solving", topicB, [topicB], `Tell me about a problem or unexpected situation you had with ${topicB}. How did you handle it?`, ["문제 상황", "해결 과정", "결과"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-09-roleplay-request", "roleplay", topicA, [topicA], `Role-play: Call a staff member and ask for information about ${topicA}. Ask at least three questions.`, ["역할극", "질문하기", "정중한 표현"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-10-roleplay-problem", "roleplay", topicA, [topicA], `Role-play: There is a problem with your plan related to ${topicA}. Explain the problem and ask for two solutions.`, ["역할극", "문제 설명", "대안 요청"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-11-unexpected-tech", "unexpected", "technology", ["technology"], "How has technology changed people's everyday lives? Give specific examples.", ["돌발 주제", "의견", "예시"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-12-unexpected-health", "unexpected", "health", ["health"], "What do people usually do to stay healthy these days? What is your opinion about that?", ["일반 의견", "건강", "예시"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-13-topic-c-comparison", "comparison", topicC, [topicC], `Compare how people enjoyed ${topicC} in the past with how they enjoy it now.`, ["사회 변화", "비교", "구체 예시"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-14-difficult-experience", "experience", "challenge", tags.slice(0, 2), "Tell me about a difficult situation you experienced recently. What did you do, and what did you learn?", ["어려운 경험", "해결", "배운 점"], answerTimeSec, difficulty),
    makeMockQuestion(level, "mock-15-final-opinion", "unexpected", "opinion", tags.slice(0, 2), "Choose one topic from today's interview and explain why it is important to you.", ["마무리 의견", "개인적 의미", "정리"], answerTimeSec, difficulty),
  ];
}

function makeMockQuestion(
  level: OPIcLevel,
  id: string,
  type: Question["type"],
  topic: string,
  surveyTags: SurveyTag[],
  prompt: string,
  evaluationFocus: string[],
  answerTimeSec: number,
  difficulty: Question["difficulty"],
): Question {
  return {
    id: `${level.toLowerCase()}-${id}`,
    level,
    type,
    topic,
    surveyTags,
    prompt,
    difficulty,
    prepTimeSec: 20,
    answerTimeSec,
    evaluationFocus,
    sampleAnswer: "",
    usefulExpressions: ["What I remember most is...", "The main reason is...", "In the end..."],
  };
}
