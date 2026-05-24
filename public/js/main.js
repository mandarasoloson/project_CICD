document.addEventListener('DOMContentLoaded', () => {
    
    const loginBtn = document.getElementById('login-btn');
    const orderBtn = document.getElementById('order-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }

    if (orderBtn) {
        orderBtn.addEventListener('click', makeOrder);
    }
});


function login() {
    const name = document.getElementById('username').value;
    if (!name) return;
    
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('greeting').innerText = `Bonjour ${name} !`;
}

async function makeOrder() {
    const id = document.getElementById('order-id').value;
    const amount = Number(document.getElementById('order-amount').value);
    const isVip = document.getElementById('is-vip').checked;

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, amount, isVip })
        });

        const data = await response.json();
        const resultElement = document.getElementById('result');

        if (response.ok) {
            resultElement.innerText = ` Commande ${data.id} validée. Total payé : ${data.amount}€`;
            resultElement.style.color = 'green';
        } else {
            resultElement.innerText = ` Erreur : ${data.error || 'Erreur serveur'}`;
            resultElement.style.color = 'red';
        }
    } catch (error) {
        const resultElement = document.getElementById('result');
        resultElement.innerText = ` Impossible de joindre l'API`;
        resultElement.style.color = 'red';
    }
}