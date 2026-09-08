function tick(){
  const d = new Date();
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = h + ':' + m;
}
tick(); setInterval(tick, 15000);

const navBtns = document.querySelectorAll('.nav-btn');
const panels  = document.querySelectorAll('.panel');
const screen  = document.getElementById('screen');

function activateIcon(btn, on){
  const svg = btn.querySelector('.nav-ico svg');
  if(svg) svg.setAttribute('stroke', on ? '#4FD1C5' : '#A0AEC0');
}

function switchTab(tab){
  navBtns.forEach(b=>{
    const on = b.dataset.tab === tab;
    b.classList.toggle('active', on);
    activateIcon(b, on);
  });
  panels.forEach(p=>{
    const on = p.dataset.panel === tab;
    p.classList.toggle('active', on);
  });
  screen.scrollTo({top:0, behavior:'smooth'});
}
navBtns.forEach(b=> b.addEventListener('click', ()=> switchTab(b.dataset.tab)));

const cart = [];
const bagBadge = document.getElementById('bag-badge');
const navBadge = document.getElementById('nav-badge');

function parseBRL(s){ return parseFloat(s.replace('.','').replace(',','.')); }
function fmtBRL(n){ return 'R$ ' + n.toFixed(2).replace('.',','); }

function updateBadges(){
  const n = cart.length;
  [bagBadge, navBadge].forEach(el=>{
    if(n>0){
      el.textContent = n;
      el.classList.remove('hidden');
      el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop');
    } else {
      el.classList.add('hidden');
    }
  });
}

document.querySelectorAll('.add-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    cart.push({
      name: btn.dataset.name,
      type: btn.dataset.type === 'assinatura' ? 'Assinatura -15%' : 'Compra única',
      price: parseBRL(btn.dataset.price)
    });
    updateBadges();
    toast(btn.dataset.name + ' na sacola 🛒');
  });
});

const cartOverlay = document.getElementById('cart-overlay');
const cartSheet   = document.getElementById('cart-sheet');

function renderCart(){
  const wrap  = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const footer= document.getElementById('cart-footer');
  wrap.innerHTML = '';
  if(cart.length === 0){
    empty.classList.remove('hidden');
    footer.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  footer.classList.remove('hidden');
  let total = 0;
  cart.forEach((item, i)=>{
    total += item.price;
    const isSub = item.type.startsWith('Assinatura');
    wrap.insertAdjacentHTML('beforeend', `
      <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:${isSub?'#e6fbf8':'#eef1f5'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isSub?'#38b2ac':'#718096'}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-ink text-sm truncate">${item.name}</p>
          <p class="text-[11px] ${isSub?'text-mint':'text-sub'} font-semibold">${item.type}</p>
        </div>
        <span class="font-extrabold text-ink text-sm">${fmtBRL(item.price)}</span>
        <button onclick="removeItem(${i})" class="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-90 transition shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6AD55" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`);
  });
  document.getElementById('cart-total').textContent = fmtBRL(total);
}

function removeItem(i){ cart.splice(i,1); updateBadges(); renderCart(); }

function openCart(){
  renderCart();
  cartOverlay.classList.remove('opacity-0','pointer-events-none');
  requestAnimationFrame(()=> cartSheet.classList.remove('translate-y-full'));
}
function closeCart(){
  cartSheet.classList.add('translate-y-full');
  cartOverlay.classList.add('opacity-0');
  setTimeout(()=> cartOverlay.classList.add('pointer-events-none'), 300);
}
function checkout(){
  cart.length = 0;
  updateBadges();
  closeCart();
  setTimeout(()=> toast('Pedido confirmado! Entrega a caminho 🐾'), 320);
}
cartOverlay.addEventListener('click', e=>{ if(e.target === cartOverlay) closeCart(); });

const schedOverlay = document.getElementById('sched-overlay');
const schedSheet   = document.getElementById('sched-sheet');
let selDate = null, selTime = null;

document.querySelectorAll('.schedule-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> openSchedule(btn.dataset.title));
});

function openSchedule(title){
  document.getElementById('sched-title').textContent = title;
  selDate = selTime = null;
  document.querySelectorAll('#date-row .chip').forEach(c=>c.classList.remove('sel'));
  document.querySelectorAll('#time-row .time').forEach(c=>c.classList.remove('sel'));
  schedOverlay.classList.remove('opacity-0','pointer-events-none');
  requestAnimationFrame(()=> schedSheet.classList.remove('translate-y-full'));
}
function closeSchedule(){
  schedSheet.classList.add('translate-y-full');
  schedOverlay.classList.add('opacity-0');
  setTimeout(()=> schedOverlay.classList.add('pointer-events-none'), 300);
}
document.querySelectorAll('#date-row .chip').forEach(c=>{
  c.addEventListener('click', ()=>{
    document.querySelectorAll('#date-row .chip').forEach(x=>x.classList.remove('sel'));
    c.classList.add('sel'); selDate = c.dataset.val;
  });
});
document.querySelectorAll('#time-row .time').forEach(c=>{
  c.addEventListener('click', ()=>{
    document.querySelectorAll('#time-row .time').forEach(x=>x.classList.remove('sel'));
    c.classList.add('sel'); selTime = c.dataset.val;
  });
});
function confirmSchedule(){
  if(!selDate || !selTime){ toast('Escolha a data e o horário'); return; }
  closeSchedule();
  setTimeout(()=> toast('Agendado: ' + selDate + ' às ' + selTime + ' ✅'), 320);
}
schedOverlay.addEventListener('click', e=>{ if(e.target === schedOverlay) closeSchedule(); });

function openChat(){ toast('Conectando você com a Dra. Marina 💬'); }

let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  t.querySelector('div').textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(-6px)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(0)';
  }, 2200);
}
