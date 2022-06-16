import { test, Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'https://www.tslkaraoke.com/?options=dtv&?utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring';

let vocalGuide: boolean;

const playSong = async (page: Page, search: string, songName: string, context: BrowserContext) => {
  await page.fill('[type="text"]', `${search}`);
  await page.keyboard.press('Enter');

  //search a song and launch it
  await page.locator(`div[role="button"]:has-text("${songName}")`).click();
  await page.locator(`text=${songName}${search}Play nextAdd to waiting list >> button >> nth=1`).click();

  //Allow to interact with the second page
  const pagePlayer = context.pages()[1];
  pagePlayer.on('response', async (reponse) => {
    if (reponse.request().url() === 'https://backend.api.bam-karaokeonline.com/video-metadata?scope=b2b') {
      let body = await reponse.body();
      body = JSON.parse(body.toString()) as Buffer;
      vocalGuide = body.isVocalGuideAvailable as boolean;
    }
  });

  await page.locator('[aria-label="play"]').click();
  await page.waitForSelector('.sc-iJuUWI .sc-bYEvPH');
};

const Playlist = ['Butter', 'Permission To Dance', 'Dynamite'];
const playlistSong = async (page: Page, search: string) => {
  //Search different song and create a playlist
  await page.fill('[type="text"]', `${search}`);
  await page.keyboard.press('Enter');

  await page.locator(`div[role="button"]:has-text("${Playlist[0]}")`).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.locator(`div[role="button"]:has-text("${Playlist[1]}")>> nth=0`).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.locator(`div[role="button"]:has-text("${Playlist[2]}") `).click();
  await page.locator('button:has-text("Add to waiting list")').click();

  await page.waitForTimeout(4000);
};

const checkPagePlayerIsRunning = async (context: BrowserContext) => {
  const pagePlayer: Page = context.pages()[1];

  const word = await pagePlayer.evaluate(() => {
    const word = [];
    const numberWord = document.querySelectorAll('.word').length;
    const wordSong = document.querySelectorAll('.word');
    for (let i = 0; i < numberWord; i++) {
      word.push(wordSong[i].textContent);
    }
    return word;
  });

  if (word.length === 0) {
    throw new Error('Player is not running');
  }
};

test('Research function', async ({ page }) => {
  
  //search a song
  await page.fill('[type="text"]', 'PNL');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  //count the number of element wich containt this classes
  const song = page.locator('.MuiListItem-container');
  const numberSong = await song.count();
  if (numberSong === 0) {
    throw new Error('Search failed, no song was found');
  }
});

test('Start an english speaking song', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];

  await playSong(page, 'Diana Ross', 'Upside Down', context);

  //wait the timer to appear and read it
  await page.waitForSelector('.sc-iJuUWI .sc-bYEvPH');
  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(10000);
  const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }
});

test('Start a French-speaking song', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];
  await playSong(page, 'PNL', 'Au dd', context);

  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(10000);

  const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }
});

test('Start a song with a accentuated characters in its title', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];
  await playSong(page, 'Images', 'Les démons de minuit', context);

  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(10000);

  const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }
});

test('Start a MP4 song', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];
  await playSong(page, 'BTS', 'Butter', context);

  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(10000);
  const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }
});

test('Playlist', async ({ page }) => {
  await playlistSong(page, 'BTS');

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

test('Play/Pause button', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];
  await playSong(page, 'PNL', 'Au DD', context);

  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(15000);
  await pagePlayer.waitForSelector('.sc-kiYtDG');

  await page.locator('[aria-label="play"]').click();
  await page.waitForTimeout(7000);
  const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(7000);

  //await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }

  const afterPauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  if (currentTimerMusic !== afterPauseTimerMusic) {
    throw new Error("Pause button doesn't work");
  }
});

test('Back button', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Dynamite', context);

  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(8000);

  //click on the back button
  const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Dynamite | BTS' + timer + 'Vocal guide >> button >> nth=0')
    .first()
    .click();
  await page.waitForTimeout(1000);

  const afterBackTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  if (timerMusicBegin !== afterBackTimerMusic) {
    throw new Error("Button back doesn't work");
  }
});

test('Next button', async ({ page }) => {
  await playlistSong(page, 'BTS');

  //launch the first song of the playlist
  await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
  await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();
  await page.waitForTimeout(5000);

  //click on the next button
  const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Butter | BTS' + timer + 'Vocal guide >> button >> nth=2')
    .first()
    .click();

  const playlistTest = await page.evaluate(() => {
    const playlist = [];
    const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length;
    const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1');
    for (let i = 0; i < numberSong; i++) {
      playlist.push(song[i].textContent);
    }
    return playlist;
  });

  const currentSong = await page.locator('.sc-ezrdKe').innerText();

  if (currentSong !== Playlist[1] && playlistTest.length !== 1) {
    throw new Error("Next button doesn't work");
  }
});

test('Rail test', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Dynamite', context);
  await page.waitForTimeout(5000);

  await page.locator('.MuiSlider-rail').click();
  const timer = JSON.stringify(await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText());

  if (timer !== '"01:43"') {
    throw new Error("Rail doesn't work");
  }
});

test('Voice guide disable', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Dynamite', context);
  await page.waitForTimeout(5000);

  //class of the voice guide available
  if ((await page.locator('.zJhbY').isVisible()) && vocalGuide === false) {
    throw new Error("Voice guide is available but it shouldn't be");
  }
});

test('Voice guide available', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Butter', context);
  await page.waitForTimeout(5000);

  //class of the voice guide disable
  if ((await page.locator('.cvDhqK').isVisible()) || vocalGuide !== true) {
    throw new Error("Voice guide isn't available but it should be");
  }
});

test('Voice guide activated', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Butter', context);
  await page.waitForTimeout(5000);

  await page.locator('.zJhbY').click();
  await page.waitForTimeout(10000);

  if (await page.locator('.cvDhqK, .zJhbY').isVisible()) {
    throw new Error('Voice guide should be activated but it is not');
  }
});

test('Check if voice guide still activated after a song', async ({ page }) => {
  await playlistSong(page, 'BTS');

  await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
  await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

  await page.locator('.zJhbY').click();
  await page.waitForTimeout(1000);

  const timerNextButter = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Butter | BTS' + timerNextButter + 'Vocal guide >> button >> nth=2')
    .first()
    .click();
  await page.waitForTimeout(6000);

  //class of the voice guide ON
  if (await page.locator('.fpODTi').isVisible()) {
    throw new Error('Voice guide should be activated but it is not');
  }

  await page.locator('.zJhbY').click();
  await page.waitForTimeout(1000);

  const timerNextPermission = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Permission To Dance | BTS' + timerNextPermission + 'Vocal guide >> button >> nth=2')
    .first()
    .click();
  await page.waitForTimeout(3000);

  if (await page.locator('.zJhbY').isVisible()) {
    throw new Error("Voice guide is available but it shouldn't be");
  }
});

test('Voice guide activated and i can interact with button', async ({ page }) => {
  await playlistSong(page, 'BTS');

  await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
  await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

  await page.waitForTimeout(4000);
  const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(8000);

  await page.locator('.zJhbY').click();

  //Pause button
  await page.waitForTimeout(5000);
  await page.locator('[aria-label="play"]').click();
  const beforePauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page.waitForTimeout(5000);

  const afterPauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();

  if (afterPauseTimerMusic === timerMusicBegin) {
    throw new Error("Music doesn't start");
  }

  if (beforePauseTimerMusic !== afterPauseTimerMusic) {
    throw new Error("Pause button doesn't work");
  }

  //Back button
  const timerBack = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Butter | BTS' + timerBack + 'Vocal guide >> button >> nth=0')
    .first()
    .click();
  await page.waitForTimeout(1000);
  const afterBackTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  if (timerMusicBegin !== afterBackTimerMusic) {
    throw new Error("Button back doesn't work");
  }

  //Rail
  await page.locator('.MuiSlider-rail').click();
  const timer = JSON.stringify(await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText());
  if (timer !== '"01:22"') {
    throw new Error("Rail doesn't work");
  }

  //Next button
  const timerNext = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText();
  await page
    .locator('text=Butter | BTS' + timerNext + 'Vocal guide >> button >> nth=2')
    .first()
    .click();

  const playlistTest = await page.evaluate(() => {
    const playlist = [];
    const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length;
    const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1');
    for (let i = 0; i < numberSong; i++) {
      playlist.push(song[i].textContent);
    }
    return playlist;
  });

  const currentSong = await page.locator('.sc-ezrdKe').innerText();

  if (currentSong !== Playlist[1] && playlistTest.length !== 1) {
    throw new Error("Next button doesn't work");
  }
});

test('Rail test slide', async ({ page, context }) => {
  await playSong(page, 'BTS', 'Dynamite', context);

  await page.waitForSelector('[role="slider"]');
  const slider = await page.$('[role="slider"]');
  const targetTimer = '00:00';
  let isCompleted = false;
  if (slider) {
    while (!isCompleted) {
      const srcBound = await slider.boundingBox();
      if (srcBound) {
        await page.mouse.move(srcBound.x + srcBound.width / 2, srcBound.y + srcBound.height / 2);
        await page.mouse.down();
        await page.mouse.move(srcBound.x + 100, srcBound.y + srcBound.height / 2);
        await page.mouse.up();
        const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').textContent();
        if (timer == targetTimer) {
          isCompleted = true;
        }
      }
    }
  }

  if (isCompleted === false) {
    throw new Error("Slider doesn't work");
  }
});

test('Slide to the end of a song and check if the next song start correctly', async ({ page, context }) => {
  const pagePlayer = context.pages()[1];
  await playlistSong(page, 'BTS');
  await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
  await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

  await page.waitForSelector('[role="slider"]');
  const slider = await page.$('[role="slider"]');
  const targetTimer = '00:00';
  let isCompleted = false;
  if (slider) {
    while (!isCompleted) {
      const srcBound = await slider.boundingBox();
      if (srcBound) {
        await page.mouse.down({ button: 'left' });
        await page.mouse.move(srcBound.x + 100, srcBound.y);
        await page.mouse.up({ button: 'left' });
        const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').textContent();
        if (timer == targetTimer) {
          isCompleted = true;
        }
      }
    }
  }

  await page.waitForTimeout(10000);
  const currentSong = await page.locator('.sc-ezrdKe').innerText();

  await pagePlayer.waitForSelector('.sc-kiYtDG');
  await checkPagePlayerIsRunning(context);

  if (currentSong !== Playlist[1]) {
    throw new Error("Slider doesn't work");
  }
});

test.beforeEach(async ({ page }) => {
  // load homepage before each test
  await page.goto(BASE_URL);
  for (let i = 0; i < 2; i++) {
    await page.locator('text=2').click();
    await page.locator('button:has-text("2")').click({
      clickCount: 4,
    });
    await page.locator('button:has-text("9")').click();
    await page.locator('text=Validate').click();
    await page.waitForTimeout(1000);
  }
  await page.waitForSelector('text= TYPE');
  page.locator('.sc-hJxCPi akaEU');
  for (let i = 1; i < 7; i++) {
    await page.locator(`button:has-text("${i}")`).click();
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
