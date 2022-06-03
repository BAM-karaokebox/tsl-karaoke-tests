import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.tslkaraoke.com/?options=dtv';

const playSong = async (page: any ,search:string ,songName :string) => {
    await page.fill('[type="text"]', `${search}`);
    await page.keyboard.press('Enter');
    
    //search a song and launch it
    await page.locator(`div[role="button"]:has-text("${songName}")`).click();
    await page.locator(`text=${songName}${search}Play nextAdd to waiting list >> button >> nth=1`).click();
    await page.locator('[aria-label="play"]').click();
    await page.waitForSelector('.sc-iJuUWI .sc-bYEvPH');
};

const Playlist = ['Butter', 'Permission To Dance', 'Dynamite']
const playlistSong = async (page: any ,search:string) => {

    //Search different song and create a playlist
    await page.fill('[type="text"]', `${search}`);
    await page.keyboard.press('Enter');

    await page.locator(`div[role="button"]:has-text("${Playlist[0]}")`).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.locator(`div[role="button"]:has-text("${Playlist[1]}")>> nth=0`).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.locator(`div[role="button"]:has-text("${Playlist[2]}") `).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.waitForTimeout(4000)
};

test('Research function', async ({ page, context }) => {
    //search a song
    await page.fill('[type="text"]', 'PNL');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000)
    //count the number of elemetn wich containt this classes
    const song = page.locator('.MuiListItem-container');
    const numberSong = await song.count();
    if(numberSong === 0){
        throw new Error ('Search failed, no song was found')
    }
});

test('Start an english speaking song', async ({ page, context }) => {
    await page.locator('img[alt="Bouge\\ ton\\ boule"]').click();
    await page.locator('div[role="button"]:has-text("Upside DownDiana Ross")').click();
    await page.locator('text=Upside DownDiana RossPlay nextAdd to waiting list >> button >> nth=1').click();
    await page.locator('[aria-label="play"]').click();
    
    //wait the timer to appear and read it
    await page.waitForSelector('.sc-iJuUWI .sc-bYEvPH');
    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(10000)
    const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    
    if (currentTimerMusic === timerMusicBegin){
        throw new Error ("Music doesn't start")
    }
});

test('Start an french speaking song', async ({ page, context }) => {

    await playSong(page,'PNL','Au dd')

    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(10000)

    const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    if (currentTimerMusic === timerMusicBegin){
        throw new Error ("Music doesn't start")
    }
});

test('Start a song with an emphasis', async ({ page, context }) => {

    await playSong(page,'Images' ,'Les démons de minuit')

    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(10000)

    const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()


    if (currentTimerMusic === timerMusicBegin){
        throw new Error ("Music doesn't start")
    }
});

test('Start a MP4 song', async ({ page, context }) => {

    await playSong(page, 'BTS', 'Dynamite')

    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(10000)
    const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    if (currentTimerMusic === timerMusicBegin){
        throw new Error ("Music doesn't start")
    }
});

test('Playlist', async ({ page, context }) => {

    await playlistSong(page, 'BTS')

    const playlistTest = await page.evaluate(() => {
        const playlist = []
        const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length
        const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1')
        for (let i=0; i<numberSong; i++){
            playlist.push(song[i].textContent)
        }
        return playlist
    });

    for (let i=0; i<Playlist.length; i++){
        if(Playlist[i] !== playlistTest[i]){
            throw new Error ("Playlist doesn't match")
        }
    }
});

test('Play/Pause button', async ({ page, context }) => {

    await playSong(page, 'BTS', 'Dynamite')
    
    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(5000)

    await page.locator('[aria-label="play"]').click();
    await page.waitForTimeout(4000)
    const currentTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(4000)

    if (currentTimerMusic === timerMusicBegin){
         throw new Error ("Music doesn't start")
    }

    const afterPauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    if (currentTimerMusic !== afterPauseTimerMusic){
        throw new Error ("Pause button doesn't work")
    }
});

test('Back button', async ({ page, context }) => {

    await playSong(page, 'BTS', 'Dynamite')

    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(8000)

    //click on the back button
    const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Dynamite | BTS"+timer+"Vocal guide >> button >> nth=0").first().click();
    await page.waitForTimeout(1000)

    const afterBackTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    if(timerMusicBegin !== afterBackTimerMusic){
        throw new Error ("Button back doesn't work")
    }
});

test('Next button', async ({ page, context }) => {

    await playlistSong(page, 'BTS')
    
    //launch the first song of the playlist
    await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
    await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();
    await page.waitForTimeout(5000)

    //click on the back button
    const timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Butter | BTS"+timer+"Vocal guide >> button >> nth=2").first().click();

    const playlistTest = await page.evaluate(() => {
        const playlist = []
        const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length
        const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1')
        for (let i=0; i<numberSong; i++){
            playlist.push(song[i].textContent)
        }
        return playlist
    });

    const currentSong = await page.locator('.sc-ezrdKe').innerText()

    if(currentSong !== Playlist[1] && playlistTest.length !== 1){
        throw new Error ("Next button doesn't work")
    }
});

test('Rail test', async ({ page, context }) => {

    await playSong(page, 'BTS', 'Dynamite')
    await page.waitForTimeout(5000)

    await page.locator('.MuiSlider-rail').click();
    const timer = JSON.stringify(await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText())

    if(timer !== '"01:43"'){
        throw new Error ("Rail doesn't work")
    }
});

test('Voice guide disable', async ({ page, context }) => {

    await playSong(page,'BTS', 'Dynamite')
    await page.waitForTimeout(5000)

    //class of the voice guide available
    if(await page.locator('.zJhbY').isVisible()){
        throw new Error ("Voice guide is available but it shouldn't be")
    }
});

test('Voice guide available', async ({ page, context }) => {

    await playSong(page,'BTS', 'Butter')
    await page.waitForTimeout(5000)

    //class of the voice guide disable
    if(await page.locator('.cvDhqK').isVisible()){
        throw new Error ("Voice guide isn't available but it should be")
    }
});

test('Voice guide activated', async ({ page, context }) => {

    await playSong(page,'BTS','Butter')
    await page.waitForTimeout(5000)

    await page.locator('.zJhbY').click()
    await page.waitForTimeout(10000)

    if(await page.locator('.cvDhqK, .zJhbY').isVisible()){
        throw new Error ("Voice guide should be activated but it is not")
    }
});

test('Check if voice guide still activated after a song', async ({ page, context }) => {

    await playlistSong(page, 'BTS')

    await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
    await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

    await page.locator('.zJhbY').click()
    await page.waitForTimeout(1000)

    const timerNextButter = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Butter | BTS"+timerNextButter+"Vocal guide >> button >> nth=2").first().click();
    await page.waitForTimeout(6000)

    //class of the voice guide ON
    if(await page.locator('.fpODTi').isVisible()){
        throw new Error ("Voice guide should be activated but it is not")
    }

    await page.locator('.zJhbY').click()
    await page.waitForTimeout(1000)

    const timerNextPermission = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Permission To Dance | BTS"+timerNextPermission+"Vocal guide >> button >> nth=2").first().click();
    await page.waitForTimeout(3000)

    if(await page.locator('.zJhbY').isVisible()){
        throw new Error ("Voice guide is available but it shouldn't be")
    }
});

test('Voice guide activated and i can interact with button', async ({ page, context }) => {

    await playlistSong(page, 'BTS')

    await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
    await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

    await page.waitForTimeout(4000)
    const timerMusicBegin = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(8000)

    await page.locator('.zJhbY').click()

    //Pause button
    await page.waitForTimeout(5000)
    await page.locator('[aria-label="play"]').click();
    const beforePauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.waitForTimeout(5000)

    const afterPauseTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()

    if (afterPauseTimerMusic === timerMusicBegin){
        throw new Error ("Music doesn't start")
    }

    if (beforePauseTimerMusic !== afterPauseTimerMusic){
        throw new Error ("Pause button doesn't work")
    }

    //Back button
    const timerBack = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Butter | BTS"+timerBack+"Vocal guide >> button >> nth=0").first().click();
    await page.waitForTimeout(1000)
    const afterBackTimerMusic = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    if(timerMusicBegin !== afterBackTimerMusic){
        throw new Error ("Button back doesn't work")
    }

    //Rail
    await page.locator('.MuiSlider-rail').click();
    const timer = JSON.stringify(await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText())
    if(timer !== '"01:22"'){
        throw new Error ("Rail doesn't work")
    }

    //Next button
    const timerNext = await page.locator('.sc-iJuUWI .sc-bYEvPH').innerText()
    await page.locator("text=Butter | BTS"+timerNext+"Vocal guide >> button >> nth=2").first().click();

    const playlistTest = await page.evaluate(() => {
        const playlist = []
        const numberSong = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1').length
        const song = document.querySelectorAll('.sc-ehSCib .MuiListItem-container .MuiTypography-body1')
        for (let i=0; i<numberSong; i++){
            playlist.push(song[i].textContent)
        }
        return playlist
    });

    const currentSong = await page.locator('.sc-ezrdKe').innerText()

    if(currentSong !== Playlist[1] && playlistTest.length !== 1){
        throw new Error ("Next button doesn't work")
    }
});

test('Rail test slide', async ({ page, context }) => {

    await playSong(page,'BTS', 'Dynamite')

    await page.waitForSelector('[role="slider"]');
    const slider = await page.$('[role="slider"]')
    let targetTimer = "00:00"
    let isCompleted = false
    if (slider){
        while (!isCompleted){
            let srcBound = await slider.boundingBox();
            if(srcBound){
                await page.mouse.move(srcBound.x + srcBound.width / 2, srcBound.y +srcBound.height / 2)
                await page.mouse.down();
                await page.mouse.move(srcBound.x + 100, srcBound.y +srcBound.height / 2)
                await page.mouse.up();
                let timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').textContent();
                if(timer == targetTimer){
                    isCompleted = true;
                }
            }
        }
    }
    
    if(isCompleted = false){
        throw new Error ("Slider doesn't work")
    }
});

test('Slide to the end of a song and check if the next song start correctly', async ({ page, context }) => {

    await playlistSong(page, 'BTS')
    await page.locator('.sc-ehSCib .MuiListItem-container div[role="button"]:has-text("Butter")').click();
    await page.locator('text=ButterBTSPlay nextDelete >> button >> nth=1').click();

    await page.waitForSelector('[role="slider"]');
    const slider = await page.$('[role="slider"]')
    let targetTimer = "00:00"
    let isCompleted = false
    if (slider){
        while (!isCompleted){
            let srcBound = await slider.boundingBox();
            if(srcBound){
                await page.mouse.down({button:'left'});
                await page.mouse.move(srcBound.x + 100, srcBound.y)
                await page.mouse.up({button:'left'});
                let timer = await page.locator('.sc-iJuUWI .sc-bYEvPH').textContent();
                if(timer == targetTimer){
                    isCompleted = true;
                }
            }
        }
    }

    await page.waitForTimeout(10000)
    const currentSong = await page.locator('.sc-ezrdKe').innerText()

    if(currentSong !==Playlist[1]){
        throw new Error ("Slider doesn't work")
    }
});

test.beforeEach(async ({ page }) => {

    // load homepage before each test
    await page.goto(BASE_URL);
    for (let i=0; i<2; i++){
        await page.locator('text=2').click()
        await page.locator('button:has-text("2")').click({
            clickCount: 4
          });
        await page.locator('button:has-text("9")').click();
        await page.locator('text=Validate').click();
        await page.waitForTimeout(1000)
    }
    await page.waitForTimeout(1000)
    await page.locator('.sc-hJxCPi akaEU')
    for (let i=1; i<7; i++){
        await page.locator(`button:has-text("${i}")`).click()
    }
    await page.locator('text=Validate').click();
    await page.waitForTimeout(1000)
    await page.locator('text=Unlimited session').click();
    await page.waitForTimeout(1000)
});

test.afterEach(async ({ page }) =>{
    await page.locator('.sc-iktFzd >> nth=0').click({
        delay: 3000
    })
    await page.locator('.sc-BXqHe >> text=2').click({
        clickCount: 5
      });
    await page.locator('button:has-text("9")').click();
    await page.locator('text=Validate').click();
    await page.locator('text=log out').click();
    await page.locator('text=Yes, i confirm').click();
})