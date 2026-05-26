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

  test('Catalogue : ajout d\'un produit digital (sans stock)', async ({ page }) => {
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

  test('Commande : parcours VIP avec réduction de 20%', async ({ page }) => {
    await page.fill('#order-id', 'CMD-ROBOT-01');
    await page.fill('#order-amount', '100');
    await page.check('#is-vip');

    await page.click('#order-btn');

    await expect(page.locator('#result')).toContainText('Commande CMD-ROBOT-01 validée. Total payé : 80€');
  });

  test('Commande : parcours standard sans réduction', async ({ page }) => {
    await page.fill('#order-id', 'CMD-ROBOT-02');
    await page.fill('#order-amount', '50');

    await page.click('#order-btn');

    await expect(page.locator('#result')).toContainText('Commande CMD-ROBOT-02 validée. Total payé : 50€');
  });

});
