// script.js

let recognition;
let currentField = null;
let timeoutHandle;

// 음성 인식 초기화 함수
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    console.log(`음성 원문: ${transcript}`);
    handleRecognizedText(transcript);
  };

  recognition.onerror = function (event) {
    console.error('음성 인식 오류:', event.error);
    alert('음성 인식 중 오류가 발생했습니다. 다시 시도해주세요.');
  };
}

// 특정 필드에 대한 음성 인식 시작
function startFieldRecognition(field) {
  if (!recognition) initRecognition();
  currentField = field;
  recognition.start();

  if (timeoutHandle) clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    recognition.stop();
  }, 2000);
}

// 숫자가 필요한 필드 여부 확인
function isNumericField(field) {
  return [
    'start-page', 'planned-end-page', 'duration',
    'end-start-page', 'end-end-page', 'end-duration'
  ].includes(field);
}

// 음성 인식 결과 처리
function handleRecognizedText(transcript) {
  document.getElementById("voice-result").textContent = `🎤 인식된 음성: ${transcript}`;
  if (!currentField) return;

  const inputEl = document.getElementById(currentField);
  if (!inputEl) return;

  if (isNumericField(currentField)) {
    const numMatch = transcript.match(/\d+/);
    if (numMatch) {
      inputEl.value = numMatch[0];
    } else {
      alert(`⚠️ ${currentField} 항목에서 숫자를 추출하지 못했어요.`);
    }
  } else {
    inputEl.value = transcript.trim();
  }
}

// 학습 시작 기록 제출 함수
function submitStartStudy() {
  const book = document.getElementById('book').value;
  const startPage = document.getElementById('start-page').value;
  const plannedEndPage = document.getElementById('planned-end-page').value;
  const duration = document.getElementById('duration').value;

  if (!book || !startPage || !plannedEndPage || !duration) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60000); // 분 → 밀리초

  // ✅ Google Calendar 이벤트 등록
  gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: `[학습 시작] ${book}`,
      description: `교재: ${book}, ${startPage}~${plannedEndPage}페이지, ${duration}분`,
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Seoul' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Seoul' }
    }
  }).then(response => {
    console.log("📅 학습 시작 기록 완료:", response);
  }, error => {
    console.error("📛 캘린더 기록 실패:", error);
    alert("캘린더에 기록하는 중 오류가 발생했습니다.");
  });

  // 종료용 폼 세팅
  document.getElementById('end-book').value = book;
  document.getElementById('end-start-page').value = startPage;
  document.getElementById('end-end-page').value = plannedEndPage;
  document.getElementById('end-duration').value = duration;

  // 폼 상태 전환
  document.getElementById('study-section').style.display = 'none';
  document.getElementById('end-section').style.display = 'block';

  document.getElementById('end-book').disabled = true;
  document.getElementById('end-book-voice-btn').disabled = true;
  document.getElementById('end-start-page').disabled = true;
  document.getElementById('end-start-page-voice-btn').disabled = true;
  document.getElementById('end-end-page').disabled = false;
  document.getElementById('end-end-page-voice-btn').disabled = false;
  document.getElementById('end-duration').disabled = true;
  document.getElementById('end-duration-voice-btn').disabled = true;

  console.log(`✅ 학습 시작 기록됨: ${book}, ${startPage}~${plannedEndPage}, ${duration}분`);
}

// 학습 종료 기록 제출 함수
function submitEndStudy() {
  const book = document.getElementById('end-book').value;
  const startPage = document.getElementById('end-start-page').value;
  const endPage = document.getElementById('end-end-page').value;
  const duration = document.getElementById('end-duration').value;

  if (!endPage) {
    alert('실행 종료 페이지를 입력해주세요.');
    return;
  }

  const now = new Date();
  const start = new Date(now.getTime() - duration * 60000);

  gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: `[학습 종료] ${book}`,
      description: `실행 페이지: ${startPage}~${endPage}, 총 ${duration}분`,
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Seoul' },
      end: { dateTime: now.toISOString(), timeZone: 'Asia/Seoul' }
    }
  }).then(response => {
    console.log("📅 학습 종료 기록 완료:", response);
    alert("학습 종료 기록이 완료되었습니다.");
    location.reload(); // 새로고침
  }, error => {
    console.error("📛 캘린더 기록 실패:", error);
    alert("캘린더에 학습 종료 기록을 추가하는 중 오류가 발생했습니다.");
  });
}

// 초기 설정
window.onload = () => {
  initRecognition();
};
