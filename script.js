// script.js

// Google Calendar 연동을 위한 토큰 및 기타 설정은 별도로 처리되어야 함

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

  // 2초 후 자동 종료
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

  console.log(`✅ 학습 시작 기록됨: ${book}, ${startPage}~${plannedEndPage}, ${duration}분`);

  // 캘린더 기록 로직 추가 필요 (예: Google Calendar API 호출)

  // 종료 입력용 폼에 데이터 이전
  document.getElementById('end-book').value = book;
  document.getElementById('end-start-page').value = startPage;
  document.getElementById('end-end-page').value = plannedEndPage;
  document.getElementById('end-duration').value = duration;

  // 종료 폼에서 일부 비활성화, 일부 활성화
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
}

// 학습 종료 기록 제출 함수
function submitEndStudy() {
  const endPage = document.getElementById('end-end-page').value;

  if (!endPage) {
    alert('실행 종료 페이지를 입력해주세요.');
    return;
  }

  const endTime = new Date().toISOString();
  console.log(`✅ 학습 종료 기록됨: 종료 페이지 ${endPage}, 종료 시각: ${endTime}`);

  // 캘린더 기록 종료 로직 추가 필요 (예: Google Calendar API 호출)

  alert('학습 종료 기록이 완료되었습니다.');
  location.reload(); // 초기화
}

// 초기 설정
window.onload = () => {
  initRecognition();
};
