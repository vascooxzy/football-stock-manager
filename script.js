/* ============================================================
   KitStock — script.js
   ============================================================ */

// ─── DATA LAYER ────────────────────────────────────────────
let produtos  = JSON.parse(localStorage.getItem('ks_produtos'))  || [];
let clientes  = JSON.parse(localStorage.getItem('ks_clientes'))  || [];

function saveProdutos()  { localStorage.setItem('ks_produtos',  JSON.stringify(produtos)); }
function saveClientes()  { localStorage.setItem('ks_clientes',  JSON.stringify(clientes)); }
function uid()           { return '_' + Math.random().toString(36).substr(2,9); }

// ─── NAVIGATION ────────────────────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const pages    = document.querySelectorAll('.page');

let currentLigaFilter = '';

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // liga shortcut
    if (item.classList.contains('nav-liga')) {
      currentLigaFilter = item.dataset.liga;
      showPage('stock');
      document.getElementById('fLiga').value = currentLigaFilter;
      renderStock();
      return;
    }
    currentLigaFilter = '';
    const page = item.dataset.page;
    if (page) showPage(page);

    // close sidebar on mobile
    if (window.innerWidth < 900) sidebar.classList.remove('open');
  });
});

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (id === 'dashboard') refreshDashboard();
  if (id === 'stock')     renderStock();
  if (id === 'clientes')  renderClientes();
}

// Sidebar toggle
const sidebar       = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

// Top add btn → go to stock page and open modal
document.getElementById('topAddBtn').addEventListener('click', () => {
  navItems.forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="stock"]').classList.add('active');
  showPage('stock');
  openProdModal();
});

// ─── TOAST ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = 'toast', 2800);
}

// ─── MODAL HELPERS ─────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
});

// ─── CONFIRM DIALOG ────────────────────────────────────────
let confirmCb = null;
function confirm(msg, cb) {
  document.getElementById('confirmMsg').textContent = msg;
  confirmCb = cb;
  openModal('modalConfirm');
}
document.getElementById('confirmOkBtn').addEventListener('click', () => {
  if (confirmCb) confirmCb();
  confirmCb = null;
  closeModal('modalConfirm');
});

// ─── AUTO CALC PRODUTO ─────────────────────────────────────
window.calcProd = function() {
  const preco  = parseFloat(document.getElementById('pPreco').value) || 0;
  const frete  = parseFloat(document.getElementById('pFrete').value) || 0;
  const venda  = parseFloat(document.getElementById('pVenda').value) || 0;
  const total  = preco + frete;
  const lucro  = venda - total;
  document.getElementById('pCustoTotal').value = total.toFixed(2);
  const lField = document.getElementById('pLucro');
  lField.value = lucro.toFixed(2);
  lField.style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
};

// ─── PRODUTO MODAL ─────────────────────────────────────────
let editingProdId = null;

function openProdModal(id = null) {
  editingProdId = id;
  const form = document.getElementById('formProd');
  form.reset();
  document.getElementById('pCustoTotal').value = '0.00';
  document.getElementById('pLucro').value = '0.00';

  if (id) {
    const p = produtos.find(x => x.id === id);
    document.getElementById('modalProdTitle').textContent = 'Editar Produto';
    document.getElementById('pLiga').value    = p.liga;
    document.getElementById('pClube').value   = p.clube;
    document.getElementById('pEpoca').value   = p.epoca;
    document.getElementById('pTipo').value    = p.tipo;
    document.getElementById('pTamanho').value = p.tamanho;
    document.getElementById('pQtd').value     = p.qtd;
    document.getElementById('pPreco').value   = p.preco;
    document.getElementById('pFrete').value   = p.frete;
    document.getElementById('pVenda').value   = p.venda;
    document.getElementById('pEstado').value  = p.estado;
    calcProd();
  } else {
    document.getElementById('modalProdTitle').textContent = 'Novo Produto';
  }
  openModal('modalProd');
}

document.getElementById('addProdBtn').addEventListener('click', () => openProdModal());

document.getElementById('saveProdBtn').addEventListener('click', () => {
  const liga   = document.getElementById('pLiga').value.trim();
  const clube  = document.getElementById('pClube').value.trim();
  if (!liga || !clube) { showToast('Preenche os campos obrigatórios', 'error'); return; }

  const preco  = parseFloat(document.getElementById('pPreco').value)  || 0;
  const frete  = parseFloat(document.getElementById('pFrete').value)  || 0;
  const venda  = parseFloat(document.getElementById('pVenda').value)  || 0;

  const entry = {
    id:     editingProdId || uid(),
    liga,
    clube,
    epoca:  document.getElementById('pEpoca').value.trim(),
    tipo:   document.getElementById('pTipo').value,
    tamanho:document.getElementById('pTamanho').value,
    qtd:    parseInt(document.getElementById('pQtd').value)  || 0,
    preco,
    frete,
    custoTotal: preco + frete,
    venda,
    lucro:  venda - (preco + frete),
    estado: document.getElementById('pEstado').value
  };

  if (editingProdId) {
    const idx = produtos.findIndex(x => x.id === editingProdId);
    produtos[idx] = entry;
    showToast('Produto atualizado!');
  } else {
    produtos.push(entry);
    showToast('Produto adicionado!');
  }
  saveProdutos();
  closeModal('modalProd');
  renderStock();
  refreshDashboard();
});

// ─── STOCK TABLE ───────────────────────────────────────────
function estadoClass(e) {
  if (e === 'Disponível') return 'status-disp';
  if (e === 'Reservado')  return 'status-res';
  if (e === 'Vendido')    return 'status-vend';
  return '';
}

function renderStock() {
  const liga    = document.getElementById('fLiga').value;
  const clube   = document.getElementById('fClube').value;
  const tamanho = document.getElementById('fTamanho').value;
  const estado  = document.getElementById('fEstado').value;
  const search  = document.getElementById('globalSearch').value.toLowerCase();

  let data = produtos.filter(p => {
    if (liga    && p.liga    !== liga)    return false;
    if (clube   && p.clube   !== clube)   return false;
    if (tamanho && p.tamanho !== tamanho) return false;
    if (estado  && p.estado  !== estado)  return false;
    if (search  && !p.clube.toLowerCase().includes(search) && !p.liga.toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('stockBody');
  const empty = document.getElementById('stockEmpty');
  tbody.innerHTML = '';

  if (data.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  data.forEach(p => {
    const lucroClass = p.lucro >= 0 ? 'lucro-positive' : 'lucro-negative';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.liga}</td>
      <td class="clube-bold">${p.clube}</td>
      <td>${p.epoca || '-'}</td>
      <td>${p.tipo}</td>
      <td>${p.tamanho}</td>
      <td>${p.qtd}</td>
      <td>€${p.preco.toFixed(2)}</td>
      <td>€${p.frete.toFixed(2)}</td>
      <td>€${p.custoTotal.toFixed(2)}</td>
      <td>€${p.venda.toFixed(2)}</td>
      <td class="${lucroClass}">€${p.lucro.toFixed(2)}</td>
      <td><span class="status ${estadoClass(p.estado)}">${p.estado}</span></td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn" title="Editar" onclick="openProdModal('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="tbl-btn del" title="Eliminar" onclick="deleteProd('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  populateFilters();
}

function deleteProd(id) {
  confirm('Eliminar este produto?', () => {
    produtos = produtos.filter(p => p.id !== id);
    saveProdutos();
    renderStock();
    refreshDashboard();
    showToast('Produto eliminado', 'error');
  });
}

function populateFilters() {
  const ligas  = [...new Set(produtos.map(p => p.liga))].sort();
  const clubes = [...new Set(produtos.map(p => p.clube))].sort();

  const fLiga = document.getElementById('fLiga');
  const fClube = document.getElementById('fClube');
  const cur1 = fLiga.value, cur2 = fClube.value;

  fLiga.innerHTML  = '<option value="">Todas as Ligas</option>'  + ligas.map(l  => `<option ${l===cur1?'selected':''}>${l}</option>`).join('');
  fClube.innerHTML = '<option value="">Todos os Clubes</option>' + clubes.map(c => `<option ${c===cur2?'selected':''}>${c}</option>`).join('');
}

// Filter events
['fLiga','fClube','fTamanho','fEstado'].forEach(id => {
  document.getElementById(id).addEventListener('change', renderStock);
});
document.getElementById('clearFilters').addEventListener('click', () => {
  ['fLiga','fClube','fTamanho','fEstado'].forEach(id => document.getElementById(id).value = '');
  currentLigaFilter = '';
  renderStock();
});

// ─── CLIENTE MODAL ─────────────────────────────────────────
let editingClienteId = null;

function openClienteModal(id = null) {
  editingClienteId = id;
  document.getElementById('formCliente').reset();
  document.getElementById('cPais').value = 'Portugal';

  // populate produto select
  const sel = document.getElementById('cProduto');
  sel.innerHTML = '<option value="">Selecionar produto</option>';
  produtos.filter(p => p.estado !== 'Vendido').forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.clube} — ${p.liga} (${p.tamanho}) ${p.epoca ? '· '+p.epoca : ''}`;
    sel.appendChild(opt);
  });

  if (id) {
    const c = clientes.find(x => x.id === id);
    document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
    document.getElementById('cNome').value     = c.nome;
    document.getElementById('cTel').value      = c.tel;
    document.getElementById('cPais').value     = c.pais;
    document.getElementById('cMorada').value   = c.morada;
    document.getElementById('cCP').value       = c.cp;
    document.getElementById('cCidade').value   = c.cidade;
    document.getElementById('cProduto').value  = c.produtoId || '';
    document.getElementById('cRastreio').value = c.rastreio;
    document.getElementById('cEstado').value   = c.estado;
  } else {
    document.getElementById('modalClienteTitle').textContent = 'Novo Cliente';
  }
  openModal('modalCliente');
}

document.getElementById('addClienteBtn').addEventListener('click', () => openClienteModal());

document.getElementById('saveClienteBtn').addEventListener('click', () => {
  const nome   = document.getElementById('cNome').value.trim();
  const morada = document.getElementById('cMorada').value.trim();
  if (!nome || !morada) { showToast('Preenche os campos obrigatórios', 'error'); return; }

  const produtoId = document.getElementById('cProduto').value;

  const entry = {
    id:       editingClienteId || uid(),
    nome,
    tel:      document.getElementById('cTel').value.trim(),
    pais:     document.getElementById('cPais').value.trim(),
    morada,
    cp:       document.getElementById('cCP').value.trim(),
    cidade:   document.getElementById('cCidade').value.trim(),
    produtoId,
    rastreio: document.getElementById('cRastreio').value.trim(),
    estado:   document.getElementById('cEstado').value
  };

  if (editingClienteId) {
    const idx = clientes.findIndex(x => x.id === editingClienteId);
    clientes[idx] = entry;
    showToast('Cliente atualizado!');
  } else {
    clientes.push(entry);
    showToast('Cliente adicionado!');
  }

  // mark produto as vendido/reservado
  if (produtoId) {
    const idx = produtos.findIndex(p => p.id === produtoId);
    if (idx !== -1) {
      const estadoEnc = entry.estado;
      if (estadoEnc === 'Entregue')     produtos[idx].estado = 'Vendido';
      else if (estadoEnc !== 'Em preparação') produtos[idx].estado = 'Reservado';
      saveProdutos();
    }
  }

  saveClientes();
  closeModal('modalCliente');
  renderClientes();
  refreshDashboard();
});

// ─── CLIENTES TABLE ────────────────────────────────────────
function clienteEstadoClass(e) {
  if (e === 'Em preparação') return 'status-prep';
  if (e === 'Enviado')       return 'status-env';
  if (e === 'Entregue')      return 'status-ent';
  return '';
}

function renderClientes() {
  const estadoF = document.getElementById('fcEstado').value;
  const search  = document.getElementById('globalSearch').value.toLowerCase();

  let data = clientes.filter(c => {
    if (estadoF && c.estado !== estadoF) return false;
    if (search && !c.nome.toLowerCase().includes(search) && !c.rastreio.toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('clienteBody');
  const empty = document.getElementById('clienteEmpty');
  tbody.innerHTML = '';

  if (data.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  data.forEach(c => {
    const prod = produtos.find(p => p.id === c.produtoId);
    const prodName = prod ? `${prod.clube} (${prod.tamanho})` : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="clube-bold">${c.nome}</td>
      <td>${c.tel || '-'}</td>
      <td>${c.cidade || '-'}</td>
      <td>${c.pais || '-'}</td>
      <td>${prodName}</td>
      <td>${c.rastreio ? `<code style="font-size:.75rem;color:var(--accent-2)">${c.rastreio}</code>` : '-'}</td>
      <td><span class="status ${clienteEstadoClass(c.estado)}">${c.estado}</span></td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn" title="Editar" onclick="openClienteModal('${c.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="tbl-btn del" title="Eliminar" onclick="deleteCliente('${c.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function deleteCliente(id) {
  confirm('Eliminar este cliente?', () => {
    clientes = clientes.filter(c => c.id !== id);
    saveClientes();
    renderClientes();
    showToast('Cliente eliminado', 'error');
  });
}

document.getElementById('fcEstado').addEventListener('change', renderClientes);
document.getElementById('clearClienteFilters').addEventListener('click', () => {
  document.getElementById('fcEstado').value = '';
  renderClientes();
});

// ─── DASHBOARD ─────────────────────────────────────────────
function refreshDashboard() {
  // Date
  const d = new Date();
  document.getElementById('dashDate').textContent = d.toLocaleDateString('pt-PT', {weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // KPIs
  const totalQtd = produtos.reduce((s,p) => s + p.qtd, 0);
  const dispQtd  = produtos.filter(p => p.estado === 'Disponível').reduce((s,p) => s + p.qtd, 0);
  const vendidos = produtos.filter(p => p.estado === 'Vendido').length;
  const lucroTotal = produtos.filter(p => p.estado === 'Vendido').reduce((s,p) => s + p.lucro, 0);

  document.getElementById('kpiTotal').textContent = totalQtd;
  document.getElementById('kpiDisp').textContent  = dispQtd;
  document.getElementById('kpiVend').textContent  = vendidos;
  document.getElementById('kpiLucro').textContent = '€' + lucroTotal.toFixed(2);

  // Alerts (qtd <= 2 and not vendido)
  const alertEl = document.getElementById('alertList');
  const alertas = produtos.filter(p => p.qtd <= 2 && p.estado !== 'Vendido');
  const badge   = document.getElementById('alertBadge');
  badge.textContent = alertas.length;
  badge.setAttribute('data-count', alertas.length);

  if (alertas.length === 0) {
    alertEl.innerHTML = '<p class="empty-msg">Sem alertas de stock</p>';
  } else {
    alertEl.innerHTML = alertas.map(p => `
      <div class="alert-item">
        <span class="alert-name"><i class="fa-solid fa-shirt" style="color:var(--orange);margin-right:6px"></i>${p.clube} · ${p.tamanho}</span>
        <span class="alert-qty">${p.qtd} restante${p.qtd!==1?'s':''}</span>
      </div>`).join('');
  }

  // Top vendidos
  const topEl   = document.getElementById('topList');
  const vendMap  = {};
  produtos.filter(p => p.estado === 'Vendido').forEach(p => {
    const k = `${p.clube} (${p.liga})`;
    vendMap[k] = (vendMap[k] || 0) + 1;
  });
  const top = Object.entries(vendMap).sort((a,b) => b[1]-a[1]).slice(0,5);

  if (top.length === 0) {
    topEl.innerHTML = '<p class="empty-msg">Sem vendas registadas</p>';
  } else {
    topEl.innerHTML = top.map(([name, cnt], i) => `
      <div class="top-item">
        <span class="top-rank">${i+1}</span>
        <span class="top-name">${name}</span>
        <span class="top-sold">${cnt} vendida${cnt!==1?'s':''}</span>
      </div>`).join('');
  }

  // League bars
  const leagueEl = document.getElementById('leagueBars');
  const ligaMap  = {};
  produtos.forEach(p => { ligaMap[p.liga] = (ligaMap[p.liga] || 0) + p.qtd; });
  const entries = Object.entries(ligaMap).sort((a,b)=>b[1]-a[1]);
  const maxVal  = entries.length ? entries[0][1] : 1;

  if (entries.length === 0) {
    leagueEl.innerHTML = '<p class="empty-msg" style="text-align:center">Sem dados</p>';
  } else {
    leagueEl.innerHTML = entries.map(([liga, qtd]) => `
      <div class="league-bar-row">
        <span class="league-bar-label">${liga}</span>
        <div class="league-bar-track">
          <div class="league-bar-fill" style="width:${(qtd/maxVal*100).toFixed(1)}%"></div>
        </div>
        <span class="league-bar-val">${qtd} un.</span>
      </div>`).join('');
  }
}

// ─── GLOBAL SEARCH ─────────────────────────────────────────
document.getElementById('globalSearch').addEventListener('input', () => {
  const active = document.querySelector('.page.active');
  if (active.id === 'page-stock')    renderStock();
  if (active.id === 'page-clientes') renderClientes();
});

// ─── INIT ──────────────────────────────────────────────────
(function init() {
  refreshDashboard();
  populateFilters();
  document.getElementById('dashDate');

  // Demo seed if empty
  if (produtos.length === 0) {
    const demo = [
      { id:uid(), liga:'Primeira Liga', clube:'Benfica',     epoca:'2024/25', tipo:'Fan Version',    tamanho:'M',  qtd:5, preco:18, frete:4, custoTotal:22, venda:35, lucro:13, estado:'Disponível' },
      { id:uid(), liga:'Primeira Liga', clube:'Porto',       epoca:'2024/25', tipo:'Player Version', tamanho:'L',  qtd:2, preco:28, frete:4, custoTotal:32, venda:50, lucro:18, estado:'Disponível' },
      { id:uid(), liga:'Premier League',clube:'Manchester City',epoca:'2024/25',tipo:'Fan Version', tamanho:'XL', qtd:1, preco:20, frete:5, custoTotal:25, venda:40, lucro:15, estado:'Reservado'  },
      { id:uid(), liga:'La Liga',       clube:'Real Madrid', epoca:'2023/24', tipo:'Fan Version',    tamanho:'S',  qtd:3, preco:18, frete:4, custoTotal:22, venda:38, lucro:16, estado:'Disponível' },
      { id:uid(), liga:'La Liga',       clube:'Barcelona',   epoca:'2024/25', tipo:'Player Version', tamanho:'M',  qtd:0, preco:30, frete:5, custoTotal:35, venda:55, lucro:20, estado:'Vendido'   },
      { id:uid(), liga:'Seleções',      clube:'Portugal',    epoca:'2024',    tipo:'Fan Version',    tamanho:'L',  qtd:4, preco:22, frete:4, custoTotal:26, venda:42, lucro:16, estado:'Disponível' },
      { id:uid(), liga:'Serie A',       clube:'Inter',       epoca:'2024/25', tipo:'Fan Version',    tamanho:'M',  qtd:2, preco:19, frete:4, custoTotal:23, venda:37, lucro:14, estado:'Disponível' },
      { id:uid(), liga:'Retro',         clube:'AC Milan',    epoca:'2006/07', tipo:'Fan Version',    tamanho:'L',  qtd:1, preco:15, frete:4, custoTotal:19, venda:32, lucro:13, estado:'Disponível' },
    ];
    produtos = demo;
    saveProdutos();

    const cDemo = [
      { id:uid(), nome:'João Ferreira',   tel:'912345678', pais:'Portugal', morada:'Rua da Paz 12', cp:'1000-001', cidade:'Lisboa',   produtoId: demo[4].id, rastreio:'PT123456789PT', estado:'Entregue'      },
      { id:uid(), nome:'Maria Carvalho',  tel:'934567890', pais:'Portugal', morada:'Av. Central 5', cp:'4000-010', cidade:'Porto',    produtoId: demo[2].id, rastreio:'PT987654321PT', estado:'Em preparação' },
    ];
    clientes = cDemo;
    saveClientes();
    refreshDashboard();
    populateFilters();
  }
})();
