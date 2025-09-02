// YEAR
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// THEME toggle (clair / sombre) avec sauvegarde
const themeToggle = document.getElementById('themeToggle');
function applyTheme(isLight){
  document.documentElement.classList.toggle('light', !!isLight);
  if (themeToggle){
    themeToggle.textContent = isLight ? '🌞' : '🌙';
    themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }
}
if (themeToggle){
  themeToggle.addEventListener('click', ()=>{
    const isLight = !document.documentElement.classList.contains('light');
    applyTheme(isLight);
    localStorage.setItem('hadjer_theme', isLight ? 'light' : 'dark');
  });
  // charger thème
  const saved = localStorage.getItem('hadjer_theme');
  applyTheme(saved === 'light');
}

// SCROLL reveal - IntersectionObserver
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      entry.target.classList.add('fade-in');
      io.unobserve(entry.target);
    }
  });
},{threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// TIMELINE (index page)
const timeline = document.getElementById('timeline');
if (timeline){
  const items = [
    { when: 'Nov–Jan', what: "Recherche des formations & préparation des documents" },
    { when: 'Déc–Fév', what: "Création du compte Campus France et remplissage du dossier" },
    { when: 'Fév–Mars', what: "Soumission / validation du dossier et paiement (à confirmer)" },
    { when: 'Mars–Mai', what: "Entretiens éventuels & réponses" },
    { when: 'Juin–Juil', what: "Admission & demande de visa" },
    { when: 'Août–Sept', what: "Préparatifs et rentrée" },
  ];
  timeline.innerHTML = items.map(i => `
    <div class="item card">
      <div style="font-weight:600;color:var(--accent)">${i.when}</div>
      <div>${i.what}</div>
    </div>
  `).join('');
}

// CHECKLIST (localStorage)
const checklistEl = document.getElementById('checklist');
const CHECK_KEY = 'hadjer_checklist_v2';
const defaultTasks = [
  'Créer le compte Campus France',
  'Compléter CV et lettre de motivation',
  'Téléverser relevés & diplôme (PDF)',
  'S’inscrire au TCF / DELF (viser B2)',
  'Choisir jusqu\'à 7 formations',
  'Payer les frais Campus France',
  'Se préparer à l’entretien pédagogique',
  'Télécharger l\'attestation d\'admission',
  'Faire la demande de visa (VLS-TS)',
  'Organiser logement & assurance'
];

function loadTasks(){
  try{
    const saved = JSON.parse(localStorage.getItem(CHECK_KEY));
    if (Array.isArray(saved)) return saved;
  }catch(e){}
  return defaultTasks.map(t => ({ text: t, done: false }));
}
function saveTasks(tasks){ localStorage.setItem(CHECK_KEY, JSON.stringify(tasks)); }
function renderChecklist(){
  if (!checklistEl) return;
  const tasks = loadTasks();
  checklistEl.innerHTML = tasks.map((t, idx)=>`
    <div class="row">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-idx="${idx}">
      <input type="text" value="${t.text.replace(/"/g,'&quot;')}" data-edit="${idx}">
      <button type="button" data-del="${idx}" class="btn">Supprimer</button>
    </div>
  `).join('');
}
function getTasksFromDOM(){
  if (!checklistEl) return [];
  const rows = [...checklistEl.querySelectorAll('.row')];
  return rows.map(r=>({
    done: !!r.querySelector('input[type="checkbox"]').checked,
    text: r.querySelector('input[type="text"]').value.trim()
  }));
}
if (checklistEl){
  renderChecklist();
  checklistEl.addEventListener('input', e=>{
    if (e.target.matches('input[type="checkbox"], input[type="text"]')){
      saveTasks(getTasksFromDOM());
    }
  });
  checklistEl.addEventListener('click', e=>{
    if (e.target.matches('[data-del]')){
      const idx = Number(e.target.getAttribute('data-del'));
      const tasks = loadTasks();
      tasks.splice(idx,1);
      saveTasks(tasks);
      renderChecklist();
    }
  });
  const resetBtn = document.getElementById('resetChecklist');
  if (resetBtn) resetBtn.addEventListener('click', ()=>{
    saveTasks(defaultTasks.map(t=>({text:t,done:false})));
    renderChecklist();
  });
  const exportBtn = document.getElementById('exportChecklist');
  if (exportBtn){
    exportBtn.addEventListener('click', ()=>{
      const blob = new Blob([
        getTasksFromDOM().map(t => `${t.done ? '[x]' : '[ ]'} ${t.text}`).join('\n')
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      exportBtn.href = url;
      setTimeout(()=> URL.revokeObjectURL(url), 5000);
    });
  }
}

// BUDGET
function updateBudget(){
  const v = id => parseFloat(document.getElementById(id)?.value || '0') || 0;
  const total = v('bLogement') + v('bTransport') + v('bFood') + v('bAutres');
  const out = document.getElementById('bTotal');
  if (out) out.textContent = `${total.toFixed(0)} €`;
}
['bLogement','bTransport','bFood','bAutres'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateBudget);
});
updateBudget();

// CONTACT DEMO
const contactForm = document.getElementById('contactForm');
if (contactForm){
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    alert('Merci ! Message enregistré localement (démo).');
    contactForm.reset();
  });
}

