const state = {
  user: null,
  courses: [],
  selectedCourses: [],
  preferences: {
    preferMorning: false,
    preferAfternoon: false,
    preferSpread: false,
    preferCompact: false,
    avoidWalking: false,
    preferHighRated: false,
  },
  currentSchedule: null,
  generatedSchedules: [],
  friends: [],
  selectedFriend: null,
};

const COURSE_COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#34d399',
  '#60a5fa', '#14b8a6', '#f97316', '#f87171', '#8b5cf6',
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadCourses();
  initTabs();
  initChat();
  initPreferences();
  initScheduleGrid();
  initCatalog();
  initFriends();
  initAuth();
  initProfModal();
  await autoLogin();
});

async function loadCourses() {
  try {
    const res = await fetch('/api/courses');
    state.courses = await res.json();
  } catch (e) {
    console.error('Failed to load courses', e);
  }
}

function renderStars(quality) {
  const full = Math.floor(quality);
  const half = quality - full >= 0.3 && quality - full < 0.8;
  const empty = 5 - full - (half ? 1 : 0);
  let html = '<span class="rmp-stars">';
  for (let i = 0; i < full; i++) html += '<span class="rmp-star filled">&#9733;</span>';
  if (half) html += '<span class="rmp-star half">&#9733;</span>';
  for (let i = 0; i < empty; i++) html += '<span class="rmp-star">&#9734;</span>';
  html += '</span>';
  return html;
}

function getRmpClass(quality) {
  if (quality >= 4.0) return 'rmp-good';
  if (quality >= 3.0) return 'rmp-ok';
  return 'rmp-bad';
}

function getRmpColor(quality) {
  if (quality >= 4.0) return 'var(--green)';
  if (quality >= 3.0) return 'var(--yellow)';
  return 'var(--red)';
}

function renderRmpBadge(rmp, profName) {
  if (!rmp) return '';
  const cls = getRmpClass(rmp.quality);
  return `<span class="rmp-badge ${cls}" onclick="event.stopPropagation(); openProfModal('${profName.replace(/'/g, "\\'")}')" title="Click for details">${rmp.quality.toFixed(1)} ${renderStars(rmp.quality)}</span>`;
}

function initProfModal() {
  const modal = document.getElementById('profModal');
  const closeBtn = document.getElementById('closeProfModal');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

function openProfModal(profName) {
  let rmp = null;
  for (const course of state.courses) {
    for (const sec of course.sections) {
      if (sec.professor === profName && sec.rmp) {
        rmp = sec.rmp;
        break;
      }
    }
    if (rmp) break;
  }
  if (!rmp) return;

  const scoreClass = rmp.quality >= 4.0 ? 'good' : rmp.quality >= 3.0 ? 'ok' : 'bad';
  const scoreColor = getRmpColor(rmp.quality);
  const diffColor = rmp.difficulty >= 4.0 ? 'var(--red)' : rmp.difficulty >= 3.0 ? 'var(--yellow)' : 'var(--green)';
  const wtaColor = rmp.wouldTakeAgain >= 70 ? 'var(--green)' : rmp.wouldTakeAgain >= 50 ? 'var(--yellow)' : 'var(--red)';

  const teaches = [];
  state.courses.forEach(c => {
    c.sections.forEach(s => {
      if (s.professor === profName) {
        if (!teaches.find(t => t.courseId === c.id)) {
          teaches.push({ courseId: c.id, courseName: c.name });
        }
      }
    });
  });

  document.getElementById('profModalContent').innerHTML = `
    <div class="prof-modal-header">
      <div class="prof-score-circle ${scoreClass}">${rmp.quality.toFixed(1)}</div>
      <div class="prof-modal-info">
        <h3>${profName}</h3>
        <div class="prof-dept">${rmp.dept}</div>
        <div class="prof-ratings-count">${rmp.numRatings} ratings on RateMyProfessor</div>
        <div style="margin-top:6px">${renderStars(rmp.quality)}</div>
      </div>
    </div>

    <div class="prof-stats">
      <div class="prof-stat">
        <div class="prof-stat-value" style="color:${scoreColor}">${rmp.quality.toFixed(1)}</div>
        <div class="prof-stat-label">Quality</div>
      </div>
      <div class="prof-stat">
        <div class="prof-stat-value" style="color:${diffColor}">${rmp.difficulty.toFixed(1)}</div>
        <div class="prof-stat-label">Difficulty</div>
      </div>
      <div class="prof-stat">
        <div class="prof-stat-value" style="color:${wtaColor}">${rmp.wouldTakeAgain}%</div>
        <div class="prof-stat-label">Would Take Again</div>
      </div>
    </div>

    <div class="prof-tags">
      ${rmp.tags.map(t => `<span class="prof-tag">${t}</span>`).join('')}
    </div>

    <div class="prof-review-label">Top Review</div>
    <div class="prof-review">${rmp.topReview}</div>

    ${teaches.length > 0 ? `
      <div style="margin-top:16px">
        <div class="prof-review-label">Teaches</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${teaches.map(t => `<span class="prof-tag" style="cursor:pointer" onclick="document.getElementById('profModal').classList.remove('active'); addCourseToCart('${t.courseId}', 'primary')">${t.courseId} - ${t.courseName}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;

  document.getElementById('profModal').classList.add('active');
}

function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  const indicator = document.getElementById('tabIndicator');

  function moveIndicator(btn) {
    if (!indicator || !btn) return;
    indicator.style.width = btn.offsetWidth + 'px';
    indicator.style.transform = `translateX(${btn.offsetLeft - btn.parentElement.offsetLeft - 2}px)`;
  }

  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) {
    requestAnimationFrame(() => moveIndicator(activeBtn));
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      moveIndicator(btn);
      if (btn.dataset.tab === 'catalog') renderCatalog();
    });
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('.tab-btn.active');
    if (active) moveIndicator(active);
  });
}

function initAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const registerBtn = document.getElementById('registerBtn');

  loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
  closeLoginModal.addEventListener('click', () => loginModal.classList.remove('active'));
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('active');
  });

  registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('regUsername').value.trim();
    const displayName = document.getElementById('regDisplayName').value.trim();
    if (!username) return showToast('Please enter a username', 'error');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        state.user = data.user;
        loginModal.classList.remove('active');
        updateUserUI();
        showToast(`Welcome, ${data.user.displayName}!`, 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Registration failed', 'error');
    }
  });
}

async function autoLogin() {
  try {
    // Try to register (will fail if already exists, that's fine)
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'joey', displayName: 'Joey' }),
    });
  } catch (e) {}
  
  state.user = { username: 'joey', displayName: 'Joey', schedule: null, friends: [] };
  updateUserUI();
  await loadFriends();
}

function updateUserUI() {
  const section = document.getElementById('userSection');
  if (state.user) {
    section.innerHTML = `
      <span style="font-size:10.5px;color:var(--text-3);margin-right:6px;font-weight:450">${state.user.displayName}</span>
      <div style="width:22px;height:22px;border-radius:5px;background:var(--accent-d);display:flex;align-items:center;justify-content:center;font-weight:650;font-size:9px;color:var(--accent)">${state.user.displayName.charAt(0).toUpperCase()}</div>
    `;
    document.getElementById('friendsLoginMsg').style.display = 'none';
    document.getElementById('addFriendSection').style.display = 'block';
  }
}

function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    await handleChatMessage(msg);
  });
}

function sendQuick(msg) {
  handleChatMessage(msg);
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message system';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="message-bubble">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function handleChatMessage(message) {
  addChatMessage(message, 'user');
  showTypingIndicator();

  await new Promise(r => setTimeout(r, 200 + Math.random() * 200));

 
  if (message.toLowerCase().includes('feature') && message.toLowerCase().includes('idea')) {
    try {
      const res = await fetch('/api/feature-ideas');
      const data = await res.json();
      hideTypingIndicator();
      let text = "Here are some awesome feature ideas for CourseCraft:\n\n";
      data.features.forEach((f, i) => {
        text += `**${i + 1}.** ${f}\n`;
      });
      text += "\nWhich ones sound good to you?";
      addChatMessage(text, 'ai');
      return;
    } catch (e) {}
  }

 
  const profMatch = message.match(/(?:rate|rating|review|how is|who is|tell me about)\s+(Dr\.\s*\w+|Prof\.\s*\w+)/i);
  if (profMatch) {
    const profName = profMatch[1];
    let found = null;
    for (const course of state.courses) {
      for (const sec of course.sections) {
        if (sec.professor.toLowerCase().includes(profName.toLowerCase()) && sec.rmp) {
          found = { name: sec.professor, rmp: sec.rmp };
          break;
        }
      }
      if (found) break;
    }
    if (found) {
      hideTypingIndicator();
      const r = found.rmp;
      let text = `Here's the RMP breakdown for **${found.name}**:\n\n`;
      text += `- Quality: **${r.quality}/5** | Difficulty: **${r.difficulty}/5**\n`;
      text += `- Would Take Again: **${r.wouldTakeAgain}%**\n`;
      text += `- Tags: ${r.tags.join(', ')}\n`;
      text += `- Top Review: "${r.topReview}"\n\n`;
      text += `Click on any professor rating badge in the catalog for the full profile!`;
      addChatMessage(text, 'ai');
      return;
    }
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        currentPreferences: state.preferences,
        currentCourses: state.selectedCourses.map(c => c.courseId),
        username: state.user?.username || '',
      }),
    });
    const data = await res.json();
    hideTypingIndicator();
    
   
    if (data.parsed.preferences) {
      Object.entries(data.parsed.preferences).forEach(([key, val]) => {
        state.preferences[key] = val;
      });
      syncPreferencesUI();
    }

 
    if (data.parsed.courses && data.parsed.courses.length > 0) {
      data.parsed.courses.forEach(courseId => {
        if (!state.selectedCourses.find(c => c.courseId === courseId)) {
          addCourseToCart(courseId, 'primary');
        }
      });
    }

 
    if (data.parsed.suggestedCourses && data.parsed.suggestedCourses.length > 0) {
      data.parsed.suggestedCourses.forEach(courseId => {
        if (!state.selectedCourses.find(c => c.courseId === courseId)) {
          addCourseToCart(courseId, 'primary');
        }
      });
    }

    addChatMessage(data.text, 'ai');

 
    if (data.parsed.autoGenerate && state.selectedCourses.length > 0) {
      await generateSchedules();
      return;
    }

 
    if (data.parsed.action === 'generate' && state.selectedCourses.length > 0) {
      await generateSchedules();
      return;
    }

  } catch (e) {
    hideTypingIndicator();
    addChatMessage("Sorry, I had trouble processing that. Try again?", 'ai');
  }
}

function addChatMessage(text, type) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
 
  div.className = `chat-message ${type === 'ai' ? 'system' : type}`;
  
  const content = document.createElement('div');
  content.className = 'message-bubble';
  content.innerHTML = formatMessage(text);
  
  div.appendChild(content);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/<\/ul><br><ul>/g, '');
}

function initPreferences() {
  const prefMap = {
    prefMorning: 'preferMorning',
    prefAfternoon: 'preferAfternoon',
    prefSpread: 'preferSpread',
    prefCompact: 'preferCompact',
    prefWalking: 'avoidWalking',
    prefRMP: 'preferHighRated',
  };

  Object.entries(prefMap).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    el.addEventListener('change', () => {
      state.preferences[key] = el.checked;
      
      if (key === 'preferMorning' && el.checked) {
        state.preferences.preferAfternoon = false;
        document.getElementById('prefAfternoon').checked = false;
      }
      if (key === 'preferAfternoon' && el.checked) {
        state.preferences.preferMorning = false;
        document.getElementById('prefMorning').checked = false;
      }
      if (key === 'preferSpread' && el.checked) {
        state.preferences.preferCompact = false;
        document.getElementById('prefCompact').checked = false;
      }
      if (key === 'preferCompact' && el.checked) {
        state.preferences.preferSpread = false;
        document.getElementById('prefSpread').checked = false;
      }
    });
  });
}

function syncPreferencesUI() {
  document.getElementById('prefMorning').checked = !!state.preferences.preferMorning;
  document.getElementById('prefAfternoon').checked = !!state.preferences.preferAfternoon;
  document.getElementById('prefSpread').checked = !!state.preferences.preferSpread;
  document.getElementById('prefCompact').checked = !!state.preferences.preferCompact;
  document.getElementById('prefWalking').checked = !!state.preferences.avoidWalking;
  document.getElementById('prefRMP').checked = !!state.preferences.preferHighRated;
}

function addCourseToCart(courseId, priority, backupFor = null) {
  if (state.selectedCourses.find(c => c.courseId === courseId)) {
    showToast(`${courseId} is already in your list`, 'info');
    return;
  }
  
  const color = COURSE_COLORS[state.selectedCourses.length % COURSE_COLORS.length];
  state.selectedCourses.push({ courseId, priority, backupFor, color });
  renderCourseCart();
  showToast(`Added ${courseId}`, 'success');
}

function removeCourseFromCart(courseId) {
  state.selectedCourses = state.selectedCourses.filter(c => c.courseId !== courseId);
  state.selectedCourses = state.selectedCourses.filter(c => c.backupFor !== courseId);
  renderCourseCart();
  if (state.currentSchedule) {
    state.currentSchedule = state.currentSchedule.filter(s => s.courseId !== courseId);
    renderSchedule();
  }
}

function toggleBackup(courseId) {
  const item = state.selectedCourses.find(c => c.courseId === courseId);
  if (item) {
    item.priority = item.priority === 'primary' ? 'backup' : 'primary';
    if (item.priority === 'backup' && !item.backupFor) {
      const firstPrimary = state.selectedCourses.find(c => c.priority === 'primary' && c.courseId !== courseId);
      item.backupFor = firstPrimary?.courseId || null;
    }
    if (item.priority === 'primary') {
      item.backupFor = null;
    }
    renderCourseCart();
  }
}

function renderCourseCart() {
  const cart = document.getElementById('courseCart');
  const countEl = document.getElementById('courseCount');
  const genBtn = document.getElementById('generateBtn');
  
  countEl.textContent = state.selectedCourses.length;
  genBtn.disabled = state.selectedCourses.filter(c => c.priority === 'primary').length === 0;

  if (state.selectedCourses.length === 0) {
    cart.innerHTML = '<div class="empty-cart"><p>No courses added yet</p><small>Use the AI chat or catalog to add courses</small></div>';
    return;
  }

  cart.innerHTML = state.selectedCourses.map(item => {
    const course = state.courses.find(c => c.id === item.courseId);
    const name = course ? course.name : item.courseId;
    return `
      <div class="cart-item">
        <div class="cart-color" style="background:${item.color}"></div>
        <div class="cart-info">
          <div class="cart-course-id">${item.courseId}</div>
          <div class="cart-course-name">${name}</div>
        </div>
        <span class="cart-badge ${item.priority}" onclick="toggleBackup('${item.courseId}')" title="Click to toggle">${item.priority}</span>
        <button class="cart-remove" onclick="removeCourseFromCart('${item.courseId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generateBtn').addEventListener('click', () => generateSchedules());
});

async function generateSchedules() {
  const courseRequests = state.selectedCourses.map(c => ({
    courseId: c.courseId,
    priority: c.priority,
    backupFor: c.backupFor,
  }));

  try {
    showTypingIndicator();
    
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseRequests,
        preferences: state.preferences,
      }),
    });
    const data = await res.json();
    state.generatedSchedules = data.schedules || [];

    hideTypingIndicator();

    if (state.generatedSchedules.length === 0) {
      addChatMessage("I couldn't find any valid schedule combinations without conflicts. Try adding backup courses or adjusting your preferences.", 'ai');
      return;
    }

    renderScheduleResults();
    selectScheduleOption(0);
    
    let msg = `Found **${state.generatedSchedules.length}** schedule options! I've selected the best one (Score: ${state.generatedSchedules[0].score}).\n\n`;
    msg += `**Schedule #1** includes:\n`;
    state.generatedSchedules[0].sections.forEach(s => {
      const rmpStr = s.rmp ? ` | ${s.professor} (${s.rmp.quality}/5 RMP)` : ` | ${s.professor}`;
      msg += `- **${s.courseId}** ${s.id}: ${s.days.join('/')} ${s.startTime}-${s.endTime}${rmpStr}\n`;
    });
    
    if (state.generatedSchedules[0].warnings.length > 0) {
      msg += `\n**Heads up:**\n`;
      state.generatedSchedules[0].warnings.forEach(w => {
        msg += `- ${w}\n`;
      });
    }
    
    msg += `\nBrowse other options in the sidebar!`;
    addChatMessage(msg, 'ai');
    
  } catch (e) {
    hideTypingIndicator();
    addChatMessage("Something went wrong generating schedules. Please try again.", 'ai');
  }
}

function renderScheduleResults() {
  const section = document.getElementById('resultsSection');
  const container = document.getElementById('scheduleResults');
  section.style.display = 'block';

  container.innerHTML = state.generatedSchedules.map((sched, i) => `
    <div class="schedule-option ${i === 0 ? 'selected' : ''}" onclick="selectScheduleOption(${i})" data-index="${i}">
      <div class="option-header">
        <span class="option-rank">Option #${sched.rank}</span>
        <span class="option-score">Score: ${sched.score}</span>
      </div>
      <div class="option-sections">
        ${sched.sections.map(s => `<span class="option-section-tag">${s.id}</span>`).join('')}
      </div>
      <div class="option-prof-ratings">
        ${sched.sections.map(s => s.rmp ? `<span class="rmp-badge ${getRmpClass(s.rmp.quality)}" style="font-size:9px;padding:1px 5px">${s.professor.split(' ').pop()} ${s.rmp.quality.toFixed(1)}</span>` : '').join('')}
      </div>
      <div class="option-credits" style="margin-top:4px">${sched.totalCredits} credits</div>
      ${sched.warnings.length > 0 ? `
        <div class="option-warnings">
          ${sched.warnings.map(w => `<div class="warning-item">${w}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function selectScheduleOption(index) {
  const sched = state.generatedSchedules[index];
  if (!sched) return;

  const courseColorMap = {};
  state.selectedCourses.forEach(c => { courseColorMap[c.courseId] = c.color; });
  
  state.currentSchedule = sched.sections.map(s => ({
    ...s,
    color: courseColorMap[s.courseId] || COURSE_COLORS[0],
  }));

  renderSchedule();
  document.getElementById('totalCredits').textContent = `${sched.totalCredits} Credits`;
  document.querySelectorAll('.schedule-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });

  if (state.user) saveSchedule();
}

const TIME_START = 8;
const TIME_END = 18;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function initScheduleGrid() {
  const grid = document.getElementById('scheduleGrid');
  
  grid.innerHTML = '<div class="grid-header"></div>';
  DAYS.forEach(day => {
    grid.innerHTML += `<div class="grid-header">${day}</div>`;
  });

  for (let hour = TIME_START; hour < TIME_END; hour++) {
    const timeLabel = hour <= 12 ? `${hour}:00` : `${hour - 12}:00`;
    const ampm = hour < 12 ? 'AM' : 'PM';
    grid.innerHTML += `<div class="grid-time">${timeLabel} ${ampm}</div>`;
    
    DAYS.forEach((day) => {
      grid.innerHTML += `<div class="grid-cell" data-day="${day}" data-hour="${hour}"></div>`;
    });
  }
}

function renderSchedule() {
  document.querySelectorAll('.schedule-block').forEach(el => el.remove());

  const emptyEl = document.getElementById('scheduleEmpty');
  if (!state.currentSchedule || state.currentSchedule.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    renderFriendOverlay();
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  state.currentSchedule.forEach(section => {
    section.days.forEach(day => {
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;

      const [startH, startM] = section.startTime.split(':').map(Number);
      const [endH, endM] = section.endTime.split(':').map(Number);
      const startMinutes = (startH - TIME_START) * 60 + startM;
      const endMinutes = (endH - TIME_START) * 60 + endM;
      const duration = endMinutes - startMinutes;

      const hourCell = document.querySelector(`.grid-cell[data-day="${day}"][data-hour="${startH}"]`);
      if (!hourCell) return;

      const block = document.createElement('div');
      block.className = 'schedule-block';
      block.style.backgroundColor = section.color + '18';
      block.style.borderColor = section.color + '40';
      block.style.borderLeft = `2px solid ${section.color}`;
      block.style.color = section.color;
      block.style.top = `${(startM / 60) * 100}%`;
      block.style.height = `${(duration / 60) * 48}px`;

      let ratingHtml = '';
      if (section.rmp) {
        const rClass = getRmpClass(section.rmp.quality);
        ratingHtml = `<div class="block-rating"><span class="rmp-badge ${rClass}" style="font-size:8px;padding:1px 4px">${section.rmp.quality.toFixed(1)} &#9733;</span></div>`;
      }

      block.innerHTML = `
        <div class="block-title">${section.courseId || section.id}</div>
        <div class="block-time">${section.startTime} - ${section.endTime}</div>
        ${duration >= 50 ? `<div class="block-room">${section.building}</div>` : ''}
        ${duration >= 60 ? `<div class="block-prof">${section.professor || ''}</div>` : ''}
        ${duration >= 65 ? ratingHtml : ''}
      `;

      block.title = `${section.courseName || section.courseId}\n${section.id}\n${section.startTime}-${section.endTime}\n${section.building} ${section.room}\n${section.professor}${section.rmp ? ` (${section.rmp.quality}/5 RMP)` : ''}`;

      hourCell.appendChild(block);
    });
  });

  renderFriendOverlay();
}

function renderFriendOverlay() {
  document.querySelectorAll('.friend-block').forEach(el => el.remove());
  if (!state.selectedFriend?.schedule) return;

  state.selectedFriend.schedule.forEach(section => {
    section.days.forEach(day => {
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;

      const [startH, startM] = section.startTime.split(':').map(Number);
      const [endH, endM] = section.endTime.split(':').map(Number);
      const duration = ((endH - TIME_START) * 60 + endM) - ((startH - TIME_START) * 60 + startM);

      const hourCell = document.querySelector(`.grid-cell[data-day="${day}"][data-hour="${startH}"]`);
      if (!hourCell) return;

      const block = document.createElement('div');
      block.className = 'schedule-block friend-block';
      block.style.backgroundColor = '#ec489918';
      block.style.borderColor = '#ec4899';
      block.style.color = '#ec4899';
      block.style.top = `${(startM / 60) * 100}%`;
      block.style.height = `${(duration / 60) * 48}px`;

      block.innerHTML = `
        <div class="block-title">${state.selectedFriend.displayName}: ${section.courseId || section.id}</div>
        <div class="block-time">${section.startTime} - ${section.endTime}</div>
      `;

      hourCell.appendChild(block);
    });
  });
}

function initCatalog() {
  renderCatalog();
  document.getElementById('catalogSearch').addEventListener('input', renderCatalog);
  document.getElementById('deptFilter').addEventListener('change', renderCatalog);
}

function renderCatalog() {
  const search = document.getElementById('catalogSearch').value.toLowerCase();
  const dept = document.getElementById('deptFilter').value;
  const grid = document.getElementById('catalogGrid');

  let filtered = state.courses;
  if (dept) filtered = filtered.filter(c => c.dept === dept);
  if (search) filtered = filtered.filter(c => 
    c.id.toLowerCase().includes(search) || 
    c.name.toLowerCase().includes(search) ||
    c.sections.some(s => s.professor.toLowerCase().includes(search))
  );

  grid.innerHTML = filtered.map(course => `
    <div class="catalog-card">
      <div class="catalog-card-header">
        <div>
          <div class="catalog-dept">${course.dept}</div>
          <div class="catalog-id">${course.id}</div>
          <div class="catalog-name">${course.name}</div>
        </div>
        <span class="catalog-credits">${course.credits} cr</span>
      </div>
      <div class="catalog-sections">
        ${course.sections.map(s => {
          const avail = s.seats - s.enrolled;
          const statusClass = avail <= 0 ? 'full' : avail <= 3 ? 'low' : 'open';
          return `
            <div class="catalog-section">
              <div class="section-info">
                <div class="section-id">${s.id}</div>
                <div class="section-detail">${s.days.join('/')} ${s.startTime}-${s.endTime} | ${s.building} ${s.room}</div>
                <div class="section-prof-row">
                  <span style="color:var(--text-muted);font-size:11px">${s.professor}</span>
                  ${s.rmp ? renderRmpBadge(s.rmp, s.professor) : '<span style="font-size:10px;color:var(--text-dim)">No RMP data</span>'}
                </div>
              </div>
              <div class="section-seats">
                <div class="seats-count ${statusClass}">${avail <= 0 ? 'FULL' : avail + ' left'}</div>
                <div class="seats-label">${s.enrolled}/${s.seats}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="catalog-card-actions">
        <button class="btn btn-primary btn-sm" onclick="addCourseToCart('${course.id}', 'primary')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Primary
        </button>
        <button class="btn btn-ghost btn-sm" onclick="addCourseToCart('${course.id}', 'backup')">Backup</button>
      </div>
    </div>
  `).join('');
}

function initFriends() {
  document.getElementById('friendsLoginMsg').style.display = 'block';
  
  document.getElementById('addFriendBtn').addEventListener('click', async () => {
    if (!state.user) return showToast('Sign in first!', 'error');
    const friendUsername = document.getElementById('friendUsernameInput').value.trim();
    if (!friendUsername) return;

    try {
      const res = await fetch('/api/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: state.user.username, friendUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Added ${friendUsername} as friend!`, 'success');
        document.getElementById('friendUsernameInput').value = '';
        loadFriends();
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Failed to add friend', 'error');
    }
  });
}

async function loadFriends() {
  if (!state.user) return;
  try {
    const res = await fetch(`/api/friends/${state.user.username}`);
    const data = await res.json();
    state.friends = data.friends || [];
    renderFriendsList();
  } catch (e) {
    console.error('Failed to load friends', e);
  }
}

function renderFriendsList() {
  const list = document.getElementById('friendsList');
  
  if (state.friends.length === 0) {
    list.innerHTML = `
      <div class="empty-friends">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        <p>No friends yet</p>
        <small>Add friends by username to compare schedules</small>
      </div>
    `;
    return;
  }

  list.innerHTML = state.friends.map(f => `
    <div class="friend-card ${state.selectedFriend?.username === f.username ? 'selected' : ''}" onclick="selectFriend('${f.username}')">
      <div class="friend-avatar">${(f.displayName || f.username).charAt(0).toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${f.displayName || f.username}</div>
        <div class="friend-username">@${f.username}</div>
      </div>
      <span class="friend-schedule-badge ${f.schedule ? 'has-schedule' : 'no-schedule'}">${f.schedule ? 'Has Schedule' : 'No Schedule'}</span>
    </div>
  `).join('');
}

function selectFriend(username) {
  const friend = state.friends.find(f => f.username === username);
  state.selectedFriend = state.selectedFriend?.username === username ? null : friend;
  renderFriendsList();
  renderSchedule();
  renderFriendComparison();
  
  if (state.selectedFriend) {
    showToast(`Viewing ${friend.displayName}'s schedule`, 'info');
  }
}

function initComparisonGrid() {
  const grid = document.getElementById('comparisonGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="grid-header"></div>';
  DAYS.forEach(day => {
    grid.innerHTML += `<div class="grid-header">${day}</div>`;
  });
  for (let hour = TIME_START; hour < TIME_END; hour++) {
    const timeLabel = hour <= 12 ? `${hour}:00` : `${hour - 12}:00`;
    const ampm = hour < 12 ? 'AM' : 'PM';
    grid.innerHTML += `<div class="grid-time">${timeLabel} ${ampm}</div>`;
    DAYS.forEach(day => {
      grid.innerHTML += `<div class="grid-cell" data-day="${day}" data-hour="${hour}"></div>`;
    });
  }
}

function renderFriendComparison() {
  const emptyEl = document.getElementById('comparisonEmpty');
  const contentEl = document.getElementById('comparisonContent');
  if (!emptyEl || !contentEl) return;

  if (!state.selectedFriend) {
    emptyEl.style.display = 'flex';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = 'block';

  const f = state.selectedFriend;

  document.getElementById('comparisonHeader').innerHTML = `
    <div class="comp-friend-info">
      <div class="comp-avatar">${(f.displayName || f.username).charAt(0).toUpperCase()}</div>
      <div>
        <div class="comp-name">${f.displayName || f.username}</div>
        <div class="comp-username">@${f.username}</div>
      </div>
    </div>
    ${f.schedule ? `<span class="comp-count">${f.schedule.length} classes</span>` : ''}
  `;

  if (f.schedule && f.schedule.length > 0) {
    const myClasses = (state.currentSchedule || []).map(s => s.courseId);
    
    document.getElementById('comparisonCourses').innerHTML = `
      <div class="comp-courses-grid">
        ${f.schedule.map(s => {
          const shared = myClasses.includes(s.courseId);
          return `
            <div class="comp-course ${shared ? 'shared' : ''}">
              <div class="comp-course-id">${s.courseId}${shared ? ' <span class="comp-shared-badge">shared</span>' : ''}</div>
              <div class="comp-course-detail">${s.days.join('/')} ${s.startTime}-${s.endTime}</div>
              <div class="comp-course-detail">${s.professor || ''} &middot; ${s.building || ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    initComparisonGrid();
    const FRIEND_COLORS = ['#a78bfa','#f472b6','#fb923c','#34d399','#60a5fa','#fbbf24'];
    const courseColorMap = {};
    let ci = 0;

    f.schedule.forEach(section => {
      if (!courseColorMap[section.courseId]) {
        courseColorMap[section.courseId] = FRIEND_COLORS[ci % FRIEND_COLORS.length];
        ci++;
      }
      const color = courseColorMap[section.courseId];

      section.days.forEach(day => {
        if (DAYS.indexOf(day) === -1) return;
        const [startH, startM] = section.startTime.split(':').map(Number);
        const [endH, endM] = section.endTime.split(':').map(Number);
        const duration = ((endH - TIME_START) * 60 + endM) - ((startH - TIME_START) * 60 + startM);

        const cells = document.querySelectorAll('#comparisonGrid .grid-cell');
        let hourCell = null;
        cells.forEach(c => {
          if (c.dataset.day === day && parseInt(c.dataset.hour) === startH) hourCell = c;
        });
        if (!hourCell) return;

        const block = document.createElement('div');
        block.className = 'schedule-block';
        block.style.backgroundColor = color + '20';
        block.style.borderColor = color + '50';
        block.style.borderLeft = `2px solid ${color}`;
        block.style.color = color;
        block.style.top = `${(startM / 60) * 100}%`;
        block.style.height = `${(duration / 60) * 48}px`;

        block.innerHTML = `
          <div class="block-title">${section.courseId}</div>
          <div class="block-time">${section.startTime} - ${section.endTime}</div>
          ${duration >= 50 ? `<div class="block-room">${section.building || ''}</div>` : ''}
        `;

        hourCell.appendChild(block);
      });
    });

    if (state.currentSchedule && state.currentSchedule.length > 0) {
      state.currentSchedule.forEach(section => {
        section.days.forEach(day => {
          if (DAYS.indexOf(day) === -1) return;
          const [startH, startM] = section.startTime.split(':').map(Number);
          const [endH, endM] = section.endTime.split(':').map(Number);
          const duration = ((endH - TIME_START) * 60 + endM) - ((startH - TIME_START) * 60 + startM);

          const cells = document.querySelectorAll('#comparisonGrid .grid-cell');
          let hourCell = null;
          cells.forEach(c => {
            if (c.dataset.day === day && parseInt(c.dataset.hour) === startH) hourCell = c;
          });
          if (!hourCell) return;

          const block = document.createElement('div');
          block.className = 'schedule-block';
          block.style.backgroundColor = (section.color || '#22d3ee') + '15';
          block.style.borderColor = (section.color || '#22d3ee') + '30';
          block.style.borderLeft = `2px solid ${section.color || '#22d3ee'}`;
          block.style.color = section.color || '#22d3ee';
          block.style.top = `${(startM / 60) * 100}%`;
          block.style.height = `${(duration / 60) * 48}px`;
          block.style.opacity = '0.4';
          block.style.borderStyle = 'dashed';

          block.innerHTML = `
            <div class="block-title">You: ${section.courseId}</div>
            <div class="block-time">${section.startTime} - ${section.endTime}</div>
          `;

          hourCell.appendChild(block);
        });
      });
    }
  } else {
    document.getElementById('comparisonCourses').innerHTML = `<p style="color:var(--text-4);font-size:11px;padding:8px 0">No schedule set yet</p>`;
    document.getElementById('comparisonGrid').innerHTML = '';
  }
}

async function saveSchedule() {
  if (!state.user || !state.currentSchedule) return;
  try {
    await fetch('/api/save-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: state.user.username, schedule: state.currentSchedule }),
    });
  } catch (e) {
    console.error('Failed to save schedule');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-dot"></span>${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
