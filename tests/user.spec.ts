import { test, expect } from '@playwright/test';

test('Parcours E-commerce : Connexion et Commande VIP', async ({ page }) => {
  // 1. Le robot ouvre la page
  await page.goto('http://localhost:3000');

  // 2. Le robot se connecte
  await page.fill('#username', 'Robot Testeur');
  await page.click('#login-btn');
  
  // Vérification : l'écran de bienvenue doit s'afficher
  await expect(page.locator('#greeting')).toContainText('Bonjour Robot Testeur');

  // 3. Le robot remplit le formulaire de commande
  await page.fill('#order-id', 'CMD-ROBOT-01');
  await page.fill('#order-amount', '100');
  await page.check('#is-vip'); // Coche la réduction de 20%
  
  // 4. Le robot valide
  await page.click('#order-btn');

  // 5. Vérification finale : le message vert avec le bon calcul (80€) doit apparaître
  await expect(page.locator('#result')).toContainText('Commande CMD-ROBOT-01 validée. Total payé : 80€');
});