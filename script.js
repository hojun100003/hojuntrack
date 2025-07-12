// script.js

// 🟢 학습 시작 기록 처리
document.getElementById('study-form').addEventListener('submit', function (e) {
  e.preventDefault(); // 새로고침 방지

  const subject = document.getElementById('subject').value;
  const book = document.getElementById('book').value;
  const startPage = parseInt(document.getElementById('start-page').value);
  const plannedEndPage = parseInt(document.getElementById('planned-end-page').value);
  const duration = parseInt(document.getElementById('duration').value);

  const data = {
    type: 'start',
    subject,
    book,
    startPage,
    plannedEndPage,
    duration
  };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => alert('✅ 학습 시작 기록 완료: ' + result))
    .catch(error => alert('⚠️ 오류 발생: ' + error));
});

// 🟢 학습 종료 기록 처리
document.getElementById('end-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const actualEndPage = parseInt(document.getElementById('actual-end-page').value);

  const data = {
    type: 'end',
    actualEndPage
  };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => alert('✅ 학습 종료 기록 완료: ' + result))
    .catch(error => alert('⚠️ 오류 발생: ' + error));
});

// 🟡 음성 입력 시작
function startVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;

    parseVoiceInput(transcript);
  };

  recognition.onerror = function (event) {
    alert('음성 인식 오류: ' + event.error);
  };
}

// 🟡 음성 인식된 텍스트 분석해서 자동 입력
function parseVoiceInput(text) {
  try {
    const subject = text.match(/^\S+/)[0];
    const book = text.match(/\s(\S+)\s/)[1];
    const startPage = parseInt(text.match(/(\d+)페이지/)[1]);
    const plannedEndPage = parseInt(text.match(/에서\s*(\d+)페이지/)[1]);
    const duration = parseInt(text.match(/(\d+)분/)[1]);

    document.getElementById('subject').value = subject;
    document.getElementById('book').value = book;
    document.getElementById('start-page').value = startPage;
    document.getElementById('planned-end-page').value = plannedEndPage;
    document.getElementById('duration').value = duration;
  } catch (err) {
    alert('음성에서 정보를 정확히 인식하지 못했어요.');
  }
}
