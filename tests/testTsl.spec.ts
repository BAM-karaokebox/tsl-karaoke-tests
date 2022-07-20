import { test, Page } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL =
  'https://www.tslkaraoke.com/?options=dtv&utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring';

const Playlist = ['XTS003#', 'XTS018=', 'XTS017"'];
const playlistSong = async (page: Page, search: string) => {
  //Search different song and create a playlist
  await page.fill('[type="text"]', `${search}`);
  await page.keyboard.press('Enter');

  await page.locator(`div[role="button"]:has-text('${Playlist[0]}')`).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.locator(`div[role="button"]:has-text('${Playlist[1]}')>> nth=0`).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.locator(`div[role="button"]:has-text('${Playlist[2]}') `).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.waitForTimeout(4000);
};

test('Search function', async ({ page }) => {
  //search a song
  await page.fill('[type="text"]', 'XTS');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  //count the number of element wich containt this classes
  const song = page.locator('.MuiListItem-container');
  const numberSong = await song.count();
  if (numberSong === 0) {
    throw new Error('Search failed, no song was found');
  }
});

test('Playlist', async ({ page }) => {
  await playlistSong(page, 'XTS');

  const playlistTest = await page.evaluate(() => {
    const playlist = [];
    const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length;
    const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1');
    for (let i = 0; i < numberSong; i++) {
      playlist.push(song[i].textContent);
    }
    return playlist;
  });

  for (let i = 0; i < Playlist.length; i++) {
    if (Playlist[i] !== playlistTest[i]) {
      throw new Error("Playlist doesn't match");
    }
  }
});

test.beforeEach(async ({ page }) => {
  // load homepage before each test
  await page.goto(BASE_URL);
  for (let i = 0; i < process.env.TSL_ROOM_ID.length; i++) {
    await page.locator(`button:has-text("${process.env.TSL_ROOM_ID[i]}")`).click();
  }
    await page.locator('text=Validate').click();
    await page.waitForTimeout(1000);

  for (let i = 0; i < process.env.TSL_ADMIN_PASS.length; i++) {
    await page.locator(`button:has-text("${process.env.TSL_ADMIN_PASS[i]}")`).click();
  }
  await page.locator('text=Validate').click();
  await page.waitForTimeout(1000);  

  await page.waitForSelector('text= TYPE');
  page.locator('.sc-hJxCPi akaEU');
  for (let i = 0; i < process.env.TSL_STAFF_PASS.length; i++) {
    await page.locator(`button:has-text("${process.env.TSL_STAFF_PASS[i]}")`).click();
  }
  await page.locator('text=Validate').click();
  await page.waitForTimeout(1000);
  await page.locator('text=Unlimited session').click();
  await page.waitForTimeout(1000);
});

test.afterEach(async ({ page }) => {
  await page.locator('.sc-iktFzd >> nth=0').click({
    delay: 3000,
  });
  await page.locator('.sc-BXqHe >> text=2').click({
    clickCount: 5,
  });
  await page.locator('button:has-text("9")').click();
  await page.locator('text=Validate').click();
  await page.locator('text=log out').click();
  await page.locator('text=Yes, i confirm').click();
  await page.waitForSelector('text=2');
});
