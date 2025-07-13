// script.js

// 🎤 필드별 음성 입력을 위한 recognition 객체 설정
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ko-KR';
recognition.interimResults = true;

let currentField = null;
let recognitionTimeout = null;
let lastStartData = {};

// 🧠 필드별 음성 입력 인식 함수
function startFieldRecognition(fieldId) {
  currentField = fieldId;
  document.getElementById(`${fieldId}-voice-btn`).disabled = true;

  let transcript = '';

  recognition.start();
  console.log(`🎤 ${fieldId} 필드 음성 인식 시작됨`);

  recognition.onresult = (event) => {
    transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join('');
    console.log(`🎧 인식된 텍스트 (${fieldId}):`, transcript);

    if (recognitionTimeout) clearTimeout(recognitionTimeout);
    recognitionTimeout = setTimeout(() => {
      recognition.stop();
    }, 2000); // 🔁 2초 동안 추가 음성이 없으면 자동 종료
  };

  recognition.onend = () => {
    console.log(`🛑 ${fieldId} 필드 음성 인식 종료됨`);
    document.getElementById(`${fieldId}-voice-btn`).disabled = false;
    handleFieldTranscript(fieldId, transcript);
  };

  recognition.onerror = (event) => {
    console.error(`❌ ${fieldId} 필드 인식 오류:`, event.error);
    alert(`⚠️ ${fieldId} 항목 음성 인식 중 오류 발생: ${event.error}`);
    document.getElementById(`${fieldId}-voice-btn`).disabled = false;
  };
}

// 📝 필드별 텍스트 처리 함수
function handleFieldTranscript(fieldId, text) {
  const numberPattern = /\d+/g;
  const numbers = text.match(numberPattern);

  if (!numbers || numbers.length === 0) {
    alert(`⚠️ ${fieldId} 항목에서 숫자를 추출하지 못했어요.`);
    return;
  }

  if (fieldId === 'book') {
    document.getElementById(fieldId).value = text.trim();
  } else {
    document.getElementById(fieldId).value = parseInt(numbers[0]);
  }

  const log = document.getElementById('voice-result');
  log.innerHTML = `📝 ${fieldId} 인식된 음성: ${text}`;
}

// ✅ 학습 시작 기록 제출 함수
function submitStartStudy() {
  const book = document.getElementById('book').value.trim();
  const startPage = document.getElementById('start-page').value;
  const plannedEndPage = document.getElementById('planned-end-page').value;
  const duration = document.getElementById('duration').value;

  if (!book || !startPage || !plannedEndPage || !duration) {
    alert('⚠️ 모든 항목을 입력해주세요.');
    return;
  }

  const eventTitle = `${book} ${startPage}~${plannedEndPage} ${duration}분 학습`;
  const now = new Date();
  const startTime = now.toISOString();
  const endTime = new Date(now.getTime() + duration * 60000).toISOString();

  const event = {
    summary: eventTitle,
    start: {
      dateTime: startTime,
      timeZone: 'Asia/Seoul',
    },
    end: {
      dateTime: endTime,
      timeZone: 'Asia/Seoul',
    },
  };

  console.log('📅 전송할 이벤트:', event);
  alert('✅ 학습 시작 기록이 완료되었습니다.');

  // 저장된 정보로 상태 전환
  lastStartData = {
    book,
    startPage,
    plannedEndPage,
    duration,
  };
  switchToEndSection();
}

// 🔄 학습 종료 섹션으로 화면 전환
function switchToEndSection() {
  document.getElementById('study-section').style.display = 'none';
  const endSection = document.getElementById('end-section');
  endSection.style.display = 'block';

  document.getElementById('end-book').value = lastStartData.book;
  document.getElementById('end-book').disabled = true;
  document.getElementById('end-book-voice-btn').disabled = true;

  document.getElementById('end-start-page').value = lastStartData.startPage;
  document.getElementById('end-start-page').disabled = true;
  document.getElementById('end-start-page-voice-btn').disabled = true;

  document.getElementById('end-end-page').value = lastStartData.plannedEndPage;
  document.getElementById('end-end-page').disabled = false;
  document.getElementById('end-end-page-voice-btn').disabled = false;

  document.getElementById('end-duration').value = lastStartData.duration;
  document.getElementById('end-duration').disabled = true;
  document.getElementById('end-duration-voice-btn').disabled = true;
}

// ✅ 학습 종료 기록 제출 함수
function submitEndStudy() {
  const book = document.getElementById('end-book').value;
  const startPage = document.getElementById('end-start-page').value;
  const endPage = document.getElementById('end-end-page').value;
  const duration = document.getElementById('end-duration').value;

  if (!book || !startPage || !endPage || !duration) {
    alert('⚠️ 종료 항목 누락됨');
    return;
  }

  const eventTitle = `${book} ${startPage}~${endPage} ${duration}분 학습 종료`;
  const now = new Date();
  const startTime = lastStartData ? new Date().getTime() - duration * 60000 : now.getTime();
  const endTime = now.toISOString();

  const event = {
    summary: eventTitle,
    start: {
      dateTime: new Date(startTime).toISOString(),
      timeZone: 'Asia/Seoul',
    },
    end: {
      dateTime: endTime,
      timeZone: 'Asia/Seoul',
    },
  };

  console.log('📅 종료 이벤트 전송됨:', event);
  alert('✅ 학습 종료 기록 완료되었습니다.');

  // 상태 리셋
  document.getElementById('study-section').style.display = 'block';
  document.getElementById('end-section').style.display = 'none';
}
