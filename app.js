const chatContainer = document.getElementById('chat-container')
const input = document.getElementById('q')

// 픽셀 몬스터를 intro 문구 상단에 놓고, 텍스트 너비만큼만 좌우로 왕복하게 맞춤
const introEl = document.getElementById('intro')
const monsterEl = document.querySelector('.pixel-monster')
const MONSTER_GAP = 8 // 몬스터와 텍스트 사이 여백(px)
function alignMonster() {
  const rect = introEl.getBoundingClientRect()
  const monsterWidth = monsterEl.offsetWidth
  const monsterHeight = monsterEl.offsetHeight

  monsterEl.style.left = rect.left + 'px'
  monsterEl.style.top = (rect.top - monsterHeight - MONSTER_GAP) + 'px'
  monsterEl.style.setProperty('--walk-dist', Math.max(rect.width - monsterWidth, 0) + 'px')
}
window.addEventListener('resize', alignMonster)
alignMonster()

// 입력한 텍스트가 넘치면 인풋창 높이를 내용에 맞게 늘림
function resizeInput() {
  input.style.height = 'auto'
  input.style.height = input.scrollHeight + 'px'
}
input.addEventListener('input', resizeInput)

// 대화창에 말풍선 하나 추가 (덮어쓰기 X, 계속 쌓임). 화면엔 남지만 새로고침하면 사라짐
function addMessage(role, text) {
  const msg = document.createElement('p')
  msg.className = 'msg ' + role
  msg.textContent = text

  chatContainer.appendChild(msg)
  chatContainer.scrollTop = chatContainer.scrollHeight

  // 기록은 화면이 아니라 콘솔에만 남김
  console.log(`[${role}]`, text)

  return msg
}

// 보내기 버튼 클릭 / 엔터 입력 둘 다에서 이 함수를 호출
function sendMessage() {
  // id="q" 입력칸에 적은 질문 꺼내기
  const prompt = input.value
  if (!prompt) return

  // 첫 메시지면 중앙 레이아웃 -> 하단 고정 레이아웃으로 전환
  document.body.classList.add('chatting')

  addMessage('user', prompt)
  input.value = ''
  resizeInput()

  // 내 서버(프록시) 창구로 요청 (키 없음)
  // fetch(...).then(...).then(...).catch(...) 처럼 점(.)으로 쭉 이어붙이는 걸 "메서드 체이닝"이라 함
  // "요청 보내고(fetch) → 성공하면(then) → 또 처리하고(then) → 실패하면(catch)" 순서로 연결됨
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // 입력칸 값을 문자열로 바꿔 보내기
    body: JSON.stringify({ prompt })
  })
    // 응답을 객체로 변환
    .then(res => res.json())
    // 받은 답(reply)을 새 말풍선으로 쌓기
    .then(data => { addMessage('assistant', data.reply || data.error) })
    // 서버가 안 켜져 있으면 안내 메시지
    .catch(() => { addMessage('assistant', '❌ 서버 연결 끊김 ❌') })
}

// '보내기' 버튼에 클릭 동작 연결
document.getElementById('btn').addEventListener('click', sendMessage)

// 입력칸에서 엔터 치면 보내기 버튼 클릭과 동일하게 동작 (textarea 기본 줄바꿈은 막음)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    sendMessage()
  }
})
