// script.js

// 🟢 학습 시작 기록 처리
document.getElementById('study-form').addEventListener('submit', function (e) {
  e.preventDefault();

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

  fetch('https://script.google.com/macros/s/AKfycbzN3IiQveleCYrSZfTJyPJDpBJWZbVPwRDRlBrOtZYG7nrKiB3N_TXIcUSP-i-QYUc/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => alert('✅ 학습 종료 기록 완료: ' + result))
    .catch(error => alert('⚠️ 오류 발생: ' + error));
});

// 🟡 음성 입력 시작 (실시간 텍스트 + 오류 디버깅 개선)
function startVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.start();
  console.log("🎤 음성 인식 시작됨");

  recognition.onresult = function (event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }

    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;
    console.log("🎧 인식된 텍스트:", transcript);

    if (event.results[event.results.length - 1].isFinal) {
      parseVoiceInput(transcript);
    }
  };

  recognition.onerror = function (event) {
    console.error('🚨 음성 인식 오류 발생');
    console.error('🔍 오류 타입:', event.error);
    console.error('📄 전체 이벤트 정보:', event);

    alert(
      '⚠️ 음성 인식 오류가 발생했어요.\n' +
      '오류 유형: ' + event.error + '\n' +
      '콘솔에서 추가 정보 확인 가능 (F12 → Console)'
    );
  };
}

// 🟡 음성 인식된 텍스트 분석해서 자동 입력
// 🟡 음성 인식된 텍스트 분석해서 자동 입력
function parseVoiceInput(text) {
  try {
    const subjectMatch = text.match(/^\S+/);
    const bookMatch = text.match(/\s(\S+)\s/);
    const startPageMatch = text.match(/(\d+)페이지/);
    const plannedEndPageMatch = text.match(/에서\s*(\d+)페이지/);
    const durationMatch = text.match(/(\d+)분/);

    if (!subjectMatch || !bookMatch || !startPageMatch || !plannedEndPageMatch || !durationMatch) {
      console.warn("⚠️ 일부 정보를 인식하지 못했습니다.");
      console.warn("🧾 전체 인식된 문장:", text);
      console.warn("📌 인식 결과:");
      console.warn("subjectMatch:", subjectMatch);
      console.warn("bookMatch:", bookMatch);
      console.warn("startPageMatch:", startPageMatch);
      console.warn("plannedEndPageMatch:", plannedEndPageMatch);
      console.warn("durationMatch:", durationMatch);

      alert("음성에서 정보를 정확히 인식하지 못했어요.\n형식 예: '국어 자습서 10페이지에서 20페이지까지 30분'");
      return;
    }

    // 안전하게 값 대입
    const subject = subjectMatch[0];
    const book = bookMatch[1];
    const startPage = parseInt(startPageMatch[1]);
    const plannedEndPage = parseInt(plannedEndPageMatch[1]);
    const duration = parseInt(durationMatch[1]);

    // 화면에 자동 입력
    document.getElementById('subject').value = subject;
    document.getElementById('book').value = book;
    document.getElementById('start-page').value = startPage;
    document.getElementById('planned-end-page').value = plannedEndPage;
    document.getElementById('duration').value = duration;
  } catch (err) {
    console.error('❌ 예외 발생:', err);
    alert('음성 인식 처리 중 예상치 못한 오류가 발생했습니다.');
  }
}

