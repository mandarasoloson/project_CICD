import { test, expect } from '@playwright/test';

test.describe('TechStore.io — Parcours E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('#username', 'Robot Testeur');
    await page.click('#login-btn');
    await expect(page.locator('#greeting')).toContainText('Bonjour Robot Testeur');
  });

  test('Connexion : affiche le portail après login', async ({ page }) => {
    await expect(page.locator('#app-section')).toBeVisible();
    await expect(page.locator('#login-section')).toBeHidden();
  });

  test('Catalogue : ajout d\'un produit physique', async ({ page }) => {
    await page.click('#toggle-add-product');
    await expect(page.locator('#add-product-form')).toBeVisible();

    await page.fill('#prod-id', 'PROD-E2E-01');
    await page.fill('#prod-name', 'Laptop Pro');
    await page.fill('#prod-price', '999');
    await page.fill('#prod-category', 'electronics');
    await page.selectOption('#prod-type', 'physical');
    await page.fill('#prod-stock', '10');
    await page.click('#add-product-btn');

    await expect(page.locator('#product-result')).toContainText('Laptop Pro');
    await expect(page.locator('#product-list')).toContainText('Laptop Pro');
  });

  test('Catalogue : ajout d\'un produit digital', async ({ page }) => {
    await page.click('#toggle-add-product');
    await page.fill('#prod-id', 'PROD-E2E-02');
    await page.fill('#prod-name', 'E-Book DevOps');
    await page.fill('#prod-price', '15');
    await page.fill('#prod-category', 'books');
    await page.selectOption('#prod-type', 'digital');
    await page.click('#add-product-btn');

    await expect(page.locator('#product-result')).toContainText('E-Book DevOps');
    await expect(page.locator('#product-list')).toContainText('Digital');
  });

  test('Panier : ajout d\'un produit et checkout', async ({ page }) => {
    // IDs uniques pour isoler ce test entre plusieurs runs
    const uid = Date.now();
    const cartUser = `Robot Cart ${uid}`;
    const cartProdId = `PROD-CART-${uid}`;

    await page.goto('http://localhost:3000');
    await page.fill('#username', cartUser);
    await page.click('#login-btn');
    await expect(page.locator('#greeting')).toContainText(`Bonjour ${cartUser}`);

    await page.click('#toggle-add-product');
    await page.fill('#prod-id', cartProdId);
    await page.fill('#prod-name', 'Casque Audio E2E');
    await page.fill('#prod-price', '80');
    await page.fill('#prod-category', 'audio');
    await page.selectOption('#prod-type', 'physical');
    await page.fill('#prod-stock', '5');
    await page.click('#add-product-btn');
    await expect(page.locator('#product-result')).toContainText('Casque Audio E2E');
    await page.click('#toggle-add-product');

    await page.locator('#product-list .product-item')
      .filter({ hasText: 'Casque Audio E2E' })
      .getByRole('button', { name: '+ Panier' })
      .first()
      .click();

    await expect(page.locator('#cart-list')).toContainText('Casque Audio E2E');
    await expect(page.locator('#cart-total')).toContainText('80€');

    await page.click('#checkout-btn');
    await expect(page.locator('#checkout-result')).toContainText('Commande validée');
    await expect(page.locator('#checkout-result')).toContainText('80€');
  });

  test('Panier : remise VIP de 20% affichée avant checkout', async ({ page }) => {
    // Username unique pour garantir un panier vierge à chaque run
    const uid = Date.now();
    const vipUser = `Robot VIP ${uid}`;
    const vipProdId = `PROD-VIP-${uid}`;

    await page.goto('http://localhost:3000');
    await page.fill('#username', vipUser);
    await page.click('#login-btn');
    await expect(page.locator('#greeting')).toContainText(`Bonjour ${vipUser}`);

    await page.click('#toggle-add-product');
    await page.fill('#prod-id', vipProdId);
    await page.fill('#prod-name', 'Clavier VIP');
    await page.fill('#prod-price', '100');
    await page.fill('#prod-category', 'peripherals');
    await page.selectOption('#prod-type', 'physical');
    await page.fill('#prod-stock', '5');
    await page.click('#add-product-btn');
    await expect(page.locator('#product-result')).toContainText('Clavier VIP');
    await page.click('#toggle-add-product');

    await page.locator('#product-list .product-item')
      .filter({ hasText: 'Clavier VIP' })
      .getByRole('button', { name: '+ Panier' })
      .first()
      .click();

    await expect(page.locator('#cart-total')).toContainText('100€');
    await page.check('#is-vip');
    await expect(page.locator('#cart-total')).toContainText('80€');

    await page.click('#checkout-btn');
    await expect(page.locator('#checkout-result')).toContainText('80€');
    await expect(page.locator('#checkout-result')).toContainText('VIP');
  });

});
