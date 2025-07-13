// script.js - HojunTrack 음성 입력 및 캘린더 기록 기능 전체 스크립트

let recognition;
let activeField = null;

// 🟢 음성 인식 초기화 함수
function initializeRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.trim();
    document.getElementById("voice-result").innerText = `🎤 인식된 음성: ${transcript}`;
    handleRecognitionResult(transcript);
  };

  recognition.onerror = function (event) {
    alert(`음성 인식 오류: ${event.error}`);
  };
}

// 🟢 음성 인식 결과 처리 함수
function handleRecognitionResult(text) {
  if (!activeField) return;

  const field = document.getElementById(activeField);

  if (activeField.includes("book")) {
    field.value = text;
  } else {
    const number = parseInt(text.replace(/[^0-9]/g, ""));
    if (!isNaN(number)) {
      field.value = number;
    } else {
      alert(`${activeField} 항목에서 숫자를 추출하지 못했어요.`);
    }
  }
}

// 🟢 특정 입력 필드에 대해 음성 인식 시작
function startFieldRecognition(fieldId) {
  activeField = fieldId;
  initializeRecognition();
  recognition.start();
  setTimeout(() => recognition.stop(), 2000); // 2초 후 자동 종료
}

// 🟢 학습 시작 기록 제출 함수
function submitStartStudy() {
  const book = document.getElementById("book").value;
  const startPage = parseInt(document.getElementById("start-page").value);
  const plannedEndPage = parseInt(document.getElementById("planned-end-page").value);
  const duration = parseInt(document.getElementById("duration").value);

  if (!book || isNaN(startPage) || isNaN(plannedEndPage) || isNaN(duration)) {
    alert("모든 항목을 올바르게 입력해주세요.");
    return;
  }

  const payload = {
    type: "start",
    subject: "학습",
    book,
    startPage,
    plannedEndPage,
    duration
  };

  fetch("https://script.google.com/macros/s/AKfycby5F89KnDvmGtS-oHk4zBdKKknWx10B9OT3hylZo9Uskq7HfpIJf5wDQAYaADqmZ2c/exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      document.getElementById("study-section").style.display = "none";
      document.getElementById("end-section").style.display = "block";

      // 종료 섹션으로 값 전달
      document.getElementById("end-book").value = book;
      document.getElementById("end-start-page").value = startPage;
      document.getElementById("end-end-page").value = plannedEndPage;
      document.getElementById("end-duration").value = duration;
    })
    .catch(err => alert("전송 오류: " + err));
}

// 🟢 학습 종료 기록 제출 함수
function submitEndStudy() {
  const actualEndPage = parseInt(document.getElementById("end-end-page").value);

  if (isNaN(actualEndPage)) {
    alert("실행 종료 페이지를 올바르게 입력해주세요.");
    return;
  }

  const payload = {
    type: "end",
    actualEndPage
  };

  fetch("https://script.google.com/macros/s/AKfycby5F89KnDvmGtS-oHk4zBdKKknWx10B9OT3hylZo9Uskq7HfpIJf5wDQAYaADqmZ2c/exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => alert("전송 오류: " + err));
}
