// script.js

// 🎤 필드별 음성 입력을 위한 recognition 객체 설정
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ko-KR';
recognition.interimResults = true;

let currentField = null;
let recognitionTimeout = null;

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
  alert('✅ 학습 시작 기록이 준비되었습니다. (캘린더 전송은 생략됨)');
}
