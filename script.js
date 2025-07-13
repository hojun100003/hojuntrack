// script.js

let latestStartData = {};

// 🟢 학습 시작 기록 처리
function submitStartStudy() {
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
    .then(result => {
      alert('✅ 학습 시작 기록 완료: ' + result);
      // 학습 종료 입력란에 값 자동 채움
      latestStartData = { subject, book, startPage, duration };
      updateEndFormWithStartData();
      toggleSections(true);
    })
    .catch(error => alert('⚠️ 오류 발생: ' + error));
}

// 🛑 학습 종료 기록 처리
function submitEndStudy() {
  const actualEndPage = parseInt(document.getElementById('actual-end-page').value);
  const actualDuration = parseInt(document.getElementById('actual-duration').value);

  const data = {
    type: 'end',
    actualEndPage,
    duration: actualDuration
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

// 🔄 학습 종료 폼에 학습 시작값 복사
function updateEndFormWithStartData() {
  document.getElementById('end-subject').value = latestStartData.subject;
  document.getElementById('end-book').value = latestStartData.book;
  document.getElementById('end-start-page').value = latestStartData.startPage;
  document.getElementById('actual-duration').value = latestStartData.duration;
}

// 🔁 학습 시작/종료 섹션 토글
function toggleSections(showEndSection) {
  const startSection = document.getElementById('study-section');
  const endSection = document.getElementById('end-section');
  if (showEndSection) {
    startSection.style.opacity = '0.5';
    startSection.style.pointerEvents = 'none';
    endSection.style.opacity = '1';
    endSection.style.pointerEvents = 'auto';
  } else {
    startSection.style.opacity = '1';
    startSection.style.pointerEvents = 'auto';
    endSection.style.opacity = '0.5';
    endSection.style.pointerEvents = 'none';
  }
}

// 초기 상태 설정
window.onload = function () {
  toggleSections(false);
};
