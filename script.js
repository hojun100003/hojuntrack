// script.js

let latestStartData = {}; // 최근 시작 기록 값 저장
let recognition = null;
let isRecording = false;
let currentMode = ''; // 'start' 또는 'end'
let finalTranscript = ''; // 음성 인식 결과 저장

// 학습 시작 기록 처리
function submitStartStudy() {
  const subject = document.getElementById('subject').value;
  const book = document.getElementById('book').value;
  const startPage = parseInt(document.getElementById('start-page').value);
  const plannedEndPage = parseInt(document.getElementById('planned-end-page').value);
  const duration = parseInt(document.getElementById('duration').value);

  const data = {
    type: 'start', subject, book, startPage, plannedEndPage, duration
  };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => {
      alert('✅ 학습 시작 기록 완료: ' + result);
      latestStartData = { subject, book, startPage, duration, plannedEndPage };
      updateEndFormWithStartData();
      toggleSections(true);
    })
    .catch(error => alert('⚠️ 오류 발생: ' + error));
}

// 학습 종료 기록 처리
function submitEndStudy() {
  const actualEndPage = parseInt(document.getElementById('actual-end-page').value);
  const actualDuration = parseInt(document.getElementById('actual-duration').value);

  const data = {
    type: 'end', actualEndPage, duration: actualDuration
  };

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => {
      alert('✅ 학습 종료 기록 완료: ' + result);
      toggleSections(false);
    })
    .catch(error => alert('⚠️ 오류 발생: ' + error));
}

// 학습 종료 폼에 학습 시작값 복사
function updateEndFormWithStartData() {
  document.getElementById('end-subject').value = latestStartData.subject || '';
  document.getElementById('end-book').value = latestStartData.book || '';
  document.getElementById('end-start-page').value = latestStartData.startPage || '';
  document.getElementById('actual-end-page').value = latestStartData.plannedEndPage || '';
  document.getElementById('actual-duration').value = latestStartData.duration || '';
}

// 학습 시작/종료 섹션 토글
function toggleSections(showEnd) {
  document.getElementById('study-section').style.display = showEnd ? 'none' : 'block';
  document.getElementById('end-section').style.display = showEnd ? 'block' : 'none';
}

// 음성 입력 토글
function toggleVoiceInput(mode) {
  const btn = document.getElementById(mode === 'start' ? 'start-voice-btn' : 'end-voice-btn');
  if (!isRecording) {
    finalTranscript = '';
    startVoiceInput(mode);
    btn.textContent = mode === 'start' ? '🛑 학습 시작 음성 입력 마침' : '🛑 학습 종료 음성 입력 마침';
    btn.classList.add('blinking');
    isRecording = true;
    currentMode = mode;
  } else {
    recognition.stop();
    // onend에서 후속 처리
  }
}

// 음성 인식 시작
function startVoiceInput(mode) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    finalTranscript = transcript;
    document.getElementById('voice-result').textContent = '🎙️ 인식된 음성: ' + transcript;
  };

  recognition.onerror = function (event) {
    console.error('음성 인식 오류:', event);
    alert('⚠️ 음성 인식 오류 발생: ' + event.error);
  };

  recognition.onend = function () {
    const btn = document.getElementById(currentMode === 'start' ? 'start-voice-btn' : 'end-voice-btn');
    btn.textContent = currentMode === 'start' ? '🎙️ 학습 시작 음성 입력 개시' : '🎙️ 학습 종료 음성 입력 개시';
    btn.classList.remove('blinking');
    isRecording = false;

    if (finalTranscript.trim()) {
      parseVoiceInput(finalTranscript, currentMode);
    } else {
      alert('⚠️ 음성을 인식하지 못했습니다. 다시 시도해주세요.');
    }
  };

  recognition.start();
}

// 음성 텍스트 파싱
function parseVoiceInput(text, mode) {
  try {
    console.log('🎯 음성 원문:', text);

    const match = text.match(/(\S+)\s+(\S+)\s*(?:교재)?\s*(\d+)\s*(?:페이지|쪽)(?:부터|에서)?\s*(\d+)\s*(?:페이지|쪽)(?:까지)?\s*(\d+)\s*분/);

    console.log('🧩 정규식 매칭 결과:', match);

    if (!match) {
      alert('⚠️ 음성에서 필요한 정보를 추출하지 못했어요.\n예시: "수학 천재 10페이지에서 20페이지까지 30분"');
      return;
    }

    const [_, subject, book, startPage, endPage, duration] = match;

    if (mode === 'start') {
      document.getElementById('subject').value = subject;
      document.getElementById('book').value = book;
      document.getElementById('start-page').value = startPage;
      document.getElementById('planned-end-page').value = endPage;
      document.getElementById('duration').value = duration;
      submitStartStudy();
    } else {
      document.getElementById('actual-end-page').value = endPage;
      document.getElementById('actual-duration').value = duration;
      submitEndStudy();
    }
  } catch (e) {
    console.error('❌ 분석 오류:', e);
    alert('⚠️ 음성 분석 중 오류 발생. 콘솔에서 상세 오류를 확인하세요.');
  }
}

// 초기 상태 설정
window.onload = () => toggleSections(false);
