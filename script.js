// script.js

// ✅ 초기 로딩 시 상태 설정
window.onload = function () {
  document.getElementById('study-section').style.display = 'block';
  document.getElementById('end-section').style.display = 'none';
};

// ✅ 학습 시작 기록 처리
function submitStartStudy() {
  const subject = document.getElementById('subject').value;
  const book = document.getElementById('book').value;
  const startPage = parseInt(document.getElementById('start-page').value);
  const plannedEndPage = parseInt(document.getElementById('planned-end-page').value);
  const duration = parseInt(document.getElementById('duration').value);

  const data = { type: 'start', subject, book, startPage, plannedEndPage, duration };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => {
      alert('✅ 학습 시작 기록 완료: ' + result);
      document.getElementById('study-section').style.display = 'none';
      document.getElementById('end-section').style.display = 'block';
    })
    .catch(error => alert('⚠️ 오류 발생: ' + error));
}

// ✅ 학습 종료 기록 처리
function submitEndStudy() {
  const actualEndPage = parseInt(document.getElementById('actual-end-page').value);

  const data = { type: 'end', actualEndPage };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => {
      alert('✅ 학습 종료 기록 완료: ' + result);
      document.getElementById('end-section').style.display = 'none';
      document.getElementById('study-section').style.display = 'block';
    })
    .catch(error => alert('⚠️ 오류 발생: ' + error));
}

// ✅ 학습 시작 음성 인식
let isStartListening = false;
function toggleStartVoiceInput(button) {
  if (!isStartListening) {
    isStartListening = true;
    button.textContent = '🎤 학습 시작 음성 입력 마침';
    button.classList.add('blinking');
    startVoiceInput(transcript => {
      isStartListening = false;
      button.textContent = '🎤 학습 시작 음성 입력 개시';
      button.classList.remove('blinking');
      submitStartStudy();
    });
  }
}

// ✅ 학습 종료 음성 인식
let isEndListening = false;
function toggleEndVoiceInput(button) {
  if (!isEndListening) {
    isEndListening = true;
    button.textContent = '🎤 학습 종료 음성 입력 마침';
    button.classList.add('blinking');
    endVoiceInput(() => {
      isEndListening = false;
      button.textContent = '🎤 학습 종료 음성 입력 개시';
      button.classList.remove('blinking');
      submitEndStudy();
    });
  }
}

// 🎙️ 학습 시작 텍스트 인식 후 입력값 채우기
function startVoiceInput(callback) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;

  let finalTranscript = '';
  let timeoutId;

  recognition.onresult = event => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;
    finalTranscript = transcript;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      parseVoiceInput(finalTranscript);
      callback();
    }, 1500);
  };

  recognition.start();
}

// 🎙️ 학습 종료 텍스트 인식 후 입력값 채우기
function endVoiceInput(callback) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;

  let finalTranscript = '';
  let timeoutId;

  recognition.onresult = event => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;
    finalTranscript = transcript;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const match = finalTranscript.match(/(\d+)\s*페이지/);
      if (match) {
        document.getElementById('actual-end-page').value = match[1];
        callback();
      } else {
        alert('종료 페이지를 인식하지 못했어요. 예: "22페이지"');
      }
    }, 1500);
  };

  recognition.start();
}

// 📋 음성 분석해서 입력칸 채우기 (학습 시작용)
function parseVoiceInput(text) {
  const subject = text.match(/^\S+/)?.[0];
  const book = text.match(/\s(\S+)\s/)?.[1];
  const startPage = parseInt(text.match(/(\d+)페이지/)?.[1]);
  const plannedEndPage = parseInt(text.match(/에서\s*(\d+)페이지/)?.[1]);
  const duration = parseInt(text.match(/(\d+)분/)?.[1]);

  if (subject && book && startPage && plannedEndPage && duration) {
    document.getElementById('subject').value = subject;
    document.getElementById('book').value = book;
    document.getElementById('start-page').value = startPage;
    document.getElementById('planned-end-page').value = plannedEndPage;
    document.getElementById('duration').value = duration;
  } else {
    alert('음성에서 필요한 정보를 모두 인식하지 못했어요.');
  }
}
