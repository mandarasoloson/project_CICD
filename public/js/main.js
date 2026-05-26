document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-btn')?.addEventListener('click', login);
    document.getElementById('order-btn')?.addEventListener('click', makeOrder);
    document.getElementById('add-product-btn')?.addEventListener('click', addProduct);
    document.getElementById('refresh-products')?.addEventListener('click', loadProducts);
    document.getElementById('toggle-add-product')?.addEventListener('click', toggleAddProductForm);

    const typeSelect = document.getElementById('prod-type');
    typeSelect?.addEventListener('change', () => {
        const stockField = document.getElementById('stock-field');
        if (stockField) stockField.style.display = typeSelect.value === 'digital' ? 'none' : 'block';
    });
});

function login() {
    const name = document.getElementById('username').value.trim();
    if (!name) return;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('greeting').innerText = `Bonjour ${name} !`;
    loadProducts();
}

function toggleAddProductForm() {
    const form = document.getElementById('add-product-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        renderProducts(products);
    } catch {
        renderProducts([]);
    }
}

function renderProducts(products) {
    const list = document.getElementById('product-list');
    if (!products.length) {
        list.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Aucun produit dans le catalogue.</p>';
        return;
    }
    list.innerHTML = products.map(p => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div>
                <span class="font-medium text-sm text-gray-800">${p.name}</span>
                <span class="ml-2 text-xs text-gray-400">${p.category}</span>
            </div>
            <div class="flex items-center gap-3">
                ${p.type === 'physical'
                    ? `<span class="text-xs text-gray-500">Stock : ${p.stock}</span>`
                    : `<span class="text-xs text-blue-500">Digital</span>`}
                <span class="font-bold text-sm text-gray-900">${p.price}€</span>
            </div>
        </div>
    `).join('');
}

async function addProduct() {
    const id = document.getElementById('prod-id').value.trim();
    const name = document.getElementById('prod-name').value.trim();
    const price = Number(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value.trim();
    const type = document.getElementById('prod-type').value;
    const stockInput = document.getElementById('prod-stock').value;
    const resultEl = document.getElementById('product-result');

    const body = { id, name, price, category, type };
    if (type === 'physical') body.stock = Number(stockInput);

    try {
        const response = await fetch('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();

        if (response.ok) {
            resultEl.innerText = `Produit "${data.name}" ajouté avec succès.`;
            resultEl.style.color = 'green';
            loadProducts();
        } else {
            resultEl.innerText = `Erreur : ${data.error}`;
            resultEl.style.color = 'red';
        }
    } catch {
        resultEl.innerText = 'Impossible de joindre l\'API';
        resultEl.style.color = 'red';
    }
}

async function makeOrder() {
    const id = document.getElementById('order-id').value;
    const amount = Number(document.getElementById('order-amount').value);
    const isVip = document.getElementById('is-vip').checked;
    const resultEl = document.getElementById('result');

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, amount, isVip }),
        });
        const data = await response.json();

        if (response.ok) {
            resultEl.innerText = ` Commande ${data.id} validée. Total payé : ${data.amount}€`;
            resultEl.style.color = 'green';
        } else {
            resultEl.innerText = ` Erreur : ${data.error || 'Erreur serveur'}`;
            resultEl.style.color = 'red';
        }
    } catch {
        resultEl.innerText = ` Impossible de joindre l'API`;
        resultEl.style.color = 'red';
    }
}
