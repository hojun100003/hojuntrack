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

  fetch('https://script.google.com/macros/s/앱스스크립트URL/exec', {
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

  fetch('https://script.google.com/macros/s/앱스스크립트URL/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.text())
    .then(result => alert('✅ 학습 종료 기록 완료: ' + result))
    .catch(error => alert('⚠️ 오류 발생: ' + error));
});

// 🎙️ 학습 시작용 음성 입력 시작
function startStudyVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.start();
  console.log("🎤 학습 시작 음성 인식 시작됨");

  recognition.onresult = function (event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }

    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;
    console.log("🎧 인식된 텍스트:", transcript);

    if (event.results[event.results.length - 1].isFinal) {
      parseStartVoiceInput(transcript);
    }
  };

  recognition.onerror = function (event) {
    console.error('🚨 시작 음성 인식 오류:', event.error);
    alert('⚠️ 음성 인식 오류 발생: ' + event.error);
  };
}

// 🎙️ 학습 종료용 음성 입력 시작
function endStudyVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.start();
  console.log("🎤 학습 종료 음성 인식 시작됨");

  recognition.onresult = function (event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }

    document.getElementById('voice-result').textContent = '🎤 인식된 음성: ' + transcript;
    console.log("🎧 인식된 종료 텍스트:", transcript);

    if (event.results[event.results.length - 1].isFinal) {
      parseEndVoiceInput(transcript);
    }
  };

  recognition.onerror = function (event) {
    console.error('🚨 종료 음성 인식 오류:', event.error);
    alert('⚠️ 음성 인식 오류 발생: ' + event.error);
  };
}

// 🎯 학습 시작용 음성 텍스트 분석
function parseStartVoiceInput(text) {
  try {
    const subjectMatch = text.match(/^\S+/);
    const bookMatch = text.match(/\s(\S+)\s/);
    const startPageMatch = text.match(/(\d+)페이지/);
    const plannedEndPageMatch = text.match(/에서\s*(\d+)페이지/);
    const durationMatch = text.match(/(\d+)분/);

    if (!subjectMatch || !bookMatch || !startPageMatch || !plannedEndPageMatch || !durationMatch) {
      console.warn("❗ 일부 정보 인식 실패:", text);
      alert("⚠️ 음성 입력을 정확히 인식하지 못했어요.\n예: 수학 자습서 10페이지에서 20페이지까지 30분");
      return;
    }

    document.getElementById('subject').value = subjectMatch[0];
    document.getElementById('book').value = bookMatch[1];
    document.getElementById('start-page').value = parseInt(startPageMatch[1]);
    document.getElementById('planned-end-page').value = parseInt(plannedEndPageMatch[1]);
    document.getElementById('duration').value = parseInt(durationMatch[1]);
  } catch (err) {
    console.error('❌ 시작 인식 중 오류:', err);
  }
}

// 🎯 학습 종료용 음성 텍스트 분석
function parseEndVoiceInput(text) {
  try {
    const pageMatch = text.match(/(\d+)페이지/);
    if (!pageMatch) {
      console.warn("❗ 종료 페이지 인식 실패:", text);
      alert("⚠️ '25페이지'처럼 종료 페이지를 정확히 말해주세요.");
      return;
    }
    document.getElementById('actual-end-page').value = parseInt(pageMatch[1]);
  } catch (err) {
    console.error('❌ 종료 인식 중 오류:', err);
  }
}
