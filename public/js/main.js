document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-btn')?.addEventListener('click', login);
  document.getElementById('order-btn')?.addEventListener('click', makeOrder);
  document.getElementById('add-product-btn')?.addEventListener('click', addProduct);
  document.getElementById('refresh-products')?.addEventListener('click', loadProducts);
  document.getElementById('toggle-add-product')?.addEventListener('click', toggleAddProductForm);

  document.getElementById('prod-type')?.addEventListener('change', (e) => {
    const stockField = document.getElementById('stock-field');
    if (stockField) stockField.style.display = e.target.value === 'digital' ? 'none' : 'block';
  });
});

function login() {
  const name = document.getElementById('username').value.trim();
  if (!name) return;

  document.getElementById('login-section').style.display = 'none';
  const appSection = document.getElementById('app-section');
  appSection.style.display = 'block';
  appSection.classList.add('fade-in');

  document.getElementById('greeting').innerText = `Bonjour ${name} !`;

  const navUser = document.getElementById('nav-user');
  navUser.classList.add('visible');
  document.getElementById('nav-username').innerText = name;
  document.getElementById('nav-avatar').innerText = name.charAt(0).toUpperCase();

  loadProducts();
}

function toggleAddProductForm() {
  const form = document.getElementById('add-product-form');
  const btn  = document.getElementById('toggle-add-product');
  const open = form.style.display !== 'block';
  form.style.display = open ? 'block' : 'none';
  btn.innerText = open ? '✕ Fermer' : '+ Ajouter';
}

async function loadProducts() {
  try {
    const res = await fetch('/products');
    renderProducts(await res.json());
  } catch {
    renderProducts([]);
  }
}

function renderProducts(products) {
  const list = document.getElementById('product-list');
  if (!products.length) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7"/>
        </svg>
        <p>Catalogue vide</p>
        <small>Ajoutez votre premier produit</small>
      </div>`;
    return;
  }

  list.innerHTML = products.map(p => {
    const badge = p.type === 'digital'
      ? `<span class="badge badge-digital">Digital</span>`
      : `<span class="badge badge-physical">Physique</span>`;

    const stock = p.type === 'physical'
      ? (p.stock > 5
          ? `<span class="stock-ok">Stock : ${p.stock}</span>`
          : `<span class="stock-low">Stock : ${p.stock} ⚠</span>`)
      : '';

    return `
      <div class="product-item fade-in">
        <div>
          <div class="product-item-name">${p.name}</div>
          <div class="product-item-cat">${p.category}</div>
        </div>
        <div class="product-item-right">
          ${badge}
          ${stock}
          <span class="product-price">${p.price}€</span>
        </div>
      </div>`;
  }).join('');
}

async function addProduct() {
  const id       = document.getElementById('prod-id').value.trim();
  const name     = document.getElementById('prod-name').value.trim();
  const price    = Number(document.getElementById('prod-price').value);
  const category = document.getElementById('prod-category').value.trim();
  const type     = document.getElementById('prod-type').value;
  const stock    = document.getElementById('prod-stock').value;
  const resultEl = document.getElementById('product-result');

  const body = { id, name, price, category, type };
  if (type === 'physical') body.stock = Number(stock);

  try {
    const res  = await fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      resultEl.innerText   = `✓ "${data.name}" ajouté avec succès`;
      resultEl.className   = 'alert alert-success alert-sm';
      ['prod-id','prod-name','prod-price','prod-category','prod-stock']
        .forEach(id => { document.getElementById(id).value = ''; });
      loadProducts();
    } else {
      resultEl.innerText = `✕ ${data.error}`;
      resultEl.className = 'alert alert-error alert-sm';
    }
  } catch {
    resultEl.innerText = '✕ Impossible de joindre l\'API';
    resultEl.className = 'alert alert-error alert-sm';
  }
}

async function makeOrder() {
  const id      = document.getElementById('order-id').value;
  const amount  = Number(document.getElementById('order-amount').value);
  const isVip   = document.getElementById('is-vip').checked;
  const resultEl = document.getElementById('result');

  try {
    const res  = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, amount, isVip }),
    });
    const data = await res.json();

    if (res.ok) {
      resultEl.innerText = ` Commande ${data.id} validée. Total payé : ${data.amount}€`;
      resultEl.className = 'alert alert-success';
    } else {
      resultEl.innerText = ` Erreur : ${data.error || 'Erreur serveur'}`;
      resultEl.className = 'alert alert-error';
    }
  } catch {
    resultEl.innerText = ' Impossible de joindre l\'API';
    resultEl.className = 'alert alert-error';
  }
}
