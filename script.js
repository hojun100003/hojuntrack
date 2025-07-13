// script.js

let recognition;
let recognizing = false;
let currentField = null;
let silenceTimer;

function startFieldRecognition(fieldId) {
  if (recognizing) {
    stopRecognition();
    return;
  }
  currentField = fieldId;
  startRecognition();
}

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    document.getElementById(currentField + '-voice-btn').classList.add('blinking');
    silenceTimer = setTimeout(() => {
      stopRecognition();
    }, 5000); // 5초 후 자동 종료 (무음 기준으로 설정할 수 없음, 단순 타이머)
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("🎙️ 음성 원문:", transcript);
    document.getElementById(currentField).value = transcript.replace(/[^0-9가-힣 ]/g, '');
    document.getElementById("voice-result").innerHTML = `🎙️ ${currentField} 인식된 음성: ${transcript}`;
  };

  recognition.onerror = (event) => {
    alert('⚠️ 음성 인식 오류: ' + event.error);
  };

  recognition.onend = () => {
    recognizing = false;
    clearTimeout(silenceTimer);
    document.getElementById(currentField + '-voice-btn').classList.remove('blinking');
  };

  recognition.start();
}

function stopRecognition() {
  if (recognition) recognition.stop();
}

function submitStartStudy() {
  const book = document.getElementById('book').value;
  const startPage = document.getElementById('start-page').value;
  const plannedEndPage = document.getElementById('planned-end-page').value;
  const duration = document.getElementById('duration').value;

  if (!book || !startPage || !plannedEndPage || !duration) {
    alert('모든 항목을 입력해야 합니다.');
    return;
  }

  console.log('✅ 학습 시작 기록:', { book, startPage, plannedEndPage, duration });
  alert('📌 학습 기록이 완료되었습니다!');

  document.getElementById('study-form').reset();
  document.getElementById('voice-result').textContent = '';
}
