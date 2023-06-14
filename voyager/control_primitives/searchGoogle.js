async function searchGoogle(term) {
    await page.goto('https://www.google.com');
    await page.type('input[name="q"]', term);
    await page.click('input[type="submit"]');
    await page.waitForNavigation();
}
