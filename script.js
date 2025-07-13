// script.js

let recognition;
let recognizing = false;
let currentMode = 'start'; // 'start' 또는 'end'

function toggleVoiceInput(mode) {
  if (recognizing) {
    stopRecognition();
    return;
  }
  currentMode = mode;
  startRecognition();
}

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    const btn = currentMode === 'start' ? document.getElementById('start-voice-btn') : document.getElementById('end-voice-btn');
    btn.textContent = currentMode === 'start' ? '🛑 학습 시작 음성 입력 마침' : '🛑 학습 종료 음성 입력 마침';
    btn.classList.add('blinking');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("🎙️ 음성 원문:", transcript);
    document.getElementById("voice-result").innerHTML = "🎙️ 인식된 음성: " + transcript;
    if (currentMode === 'start') {
      parseStartVoice(transcript);
    } else {
      parseEndVoice(transcript);
    }
  };

  recognition.onerror = (event) => {
    alert('⚠️ 음성 인식 오류: ' + event.error);
  };

  recognition.onend = () => {
    recognizing = false;
    const btn = currentMode === 'start' ? document.getElementById('start-voice-btn') : document.getElementById('end-voice-btn');
    btn.textContent = currentMode === 'start' ? '🎙️ 학습 시작 음성 입력 개시' : '🎙️ 학습 종료 음성 입력 개시';
    btn.classList.remove('blinking');
  };

  recognition.start();
}

function stopRecognition() {
  if (recognition) recognition.stop();
}

function parseStartVoice(text) {
  try {
    const bookMatch = text.match(/([가-힣\d]+)(?=\s*\d+페이지)/);
    const startPageMatch = text.match(/(\d+)페이지에서/);
    const plannedEndPageMatch = text.match(/에서\s*(\d+)페이지/);
    const durationMatch = text.match(/(\d+)분/);

    if (!bookMatch || !startPageMatch || !plannedEndPageMatch || !durationMatch) {
      alert("⚠️ 음성에서 필요한 정보를 추출하지 못했어요.\n예시: \"천재 10페이지에서 20페이지까지 30분\"");
      return;
    }

    document.getElementById('book').value = bookMatch[1];
    document.getElementById('start-page').value = startPageMatch[1];
    document.getElementById('planned-end-page').value = plannedEndPageMatch[1];
    document.getElementById('duration').value = durationMatch[1];

    submitStartStudy();
  } catch (e) {
    alert('⚠️ 음성 분석 중 오류가 발생했어요.');
  }
}

function parseEndVoice(text) {
  try {
    const endPageMatch = text.match(/(\d+)페이지/);
    const durationMatch = text.match(/(\d+)분/);

    if (!endPageMatch || !durationMatch) {
      alert("⚠️ 음성에서 필요한 정보를 추출하지 못했어요.\n예시: \"종료 45페이지 30분\"");
      return;
    }

    document.getElementById('actual-end-page').value = endPageMatch[1];
    document.getElementById('actual-duration').value = durationMatch[1];

    submitEndStudy();
  } catch (e) {
    alert('⚠️ 음성 분석 중 오류가 발생했어요.');
  }
}

function submitStartStudy() {
  const book = document.getElementById('book').value;
  const startPage = document.getElementById('start-page').value;
  const plannedEndPage = document.getElementById('planned-end-page').value;
  const duration = document.getElementById('duration').value;

  console.log('✅ 학습 시작 기록:', { book, startPage, plannedEndPage, duration });
  document.getElementById('study-section').style.display = 'none';
  document.getElementById('end-section').style.display = 'block';

  // 이전 정보 화면에 반영
  document.getElementById('end-book').value = book;
  document.getElementById('end-start-page').value = startPage;
  document.getElementById('actual-end-page').value = plannedEndPage;
  document.getElementById('actual-duration').value = duration;
}

function submitEndStudy() {
  const actualEndPage = document.getElementById('actual-end-page').value;
  const actualDuration = document.getElementById('actual-duration').value;
  console.log('✅ 학습 종료 기록:', { actualEndPage, actualDuration });
  alert('📌 학습 기록이 완료되었습니다!');

  // 초기화 후 다시 시작 가능하게 전환
  document.getElementById('study-form').reset();
  document.getElementById('end-form').reset();
  document.getElementById('study-section').style.display = 'block';
  document.getElementById('end-section').style.display = 'none';
  document.getElementById('voice-result').textContent = '';
}
