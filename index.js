const puppeteer = require('puppeteer');
const creds = require('./creds');
const USERNAME = '#login_field';
const PASSWORD = '#password';
const LOGIN_BTN = 'input.btn.btn-primary.btn-block';

const usertoSearch = 'John'
const searchUrl = `https://github.com/search?utf8=%E2%9C%93&q=${usertoSearch}&type=Users`



async function run() {
    const browser = await puppeteer.launch({
        headless:false,
        args :['--start-fullscreen']
    });
    const page = await browser.newPage();

    await page.goto('https://github.com');
    await page.screenshot({path: 'screenshots/github.png'});

    await page.goto('https://github.com/login');
    await page.click(USERNAME);
    await page.keyboard.type(creds.username);

    await page.click(PASSWORD);
    await page.keyboard.type(creds.password);

    await page.click(LOGIN_BTN);

    await page.waitForNavigation();

    await page.goto(searchUrl);

    await page.waitFor(2*1000);


    const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > a';
    const LIST_EMAIL_SELECTOR = "#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > ul > li:nth-child(2) > a";
    const LENGTH_SELECTOR_CLASS = 'user-list-item';
    const numofPages = await getNumofPages(page);
    console.log('There are a total of ' + numofPages + ' with this username');

    for(let h=1;h<=5;h++){
        //you can replace this with numofPages to go to all the pages.
        let pageURL = searchUrl+ '&p='+ h;
        await page.goto(pageURL);

        let listLength = await page.evaluate((sel)=>{
            return document.getElementsByClassName(sel).length;     
        },LENGTH_SELECTOR_CLASS);
        console.log('List Length', listLength);

        await page.waitFor(5*1000);


        for(let i=1;i<=listLength;i++){

            //replace the INDEX with the actual number;
            let userName = LIST_EMAIL_SELECTOR.replace('INDEX',i);
            console.log(userName);
            let email = LIST_EMAIL_SELECTOR.replace('INDEX',i);
            console.log(email);
/*
            let usernameofperson = await page.evaluate((sel)=>{
                return document.querySelector(sel).getAttribute('href').replace('/','');
            },userName);*/

            let usernameofperson = await page.evaluate((sel)=>{
                return document.querySelector(sel).getAttribute('href').replace('/', '');
            },userName);

            let emailofUser = await page.evaluate((sel)=>{
                let element = document.querySelector(sel);
                return element ? element.innerHTML : null;
            },email);

            //if there is no email for user, then continue
            if(!email)
                continue;

            console.log(usernameofperson +' has email ---> '+emailofUser);
        }
    }
    

    browser.close()


}

async function getNumofPages(page) {
    const NUM_USER_SELECTOR = '#js-pjax-container > div > div.columns > div.column.three-fourths.codesearch-results > div > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3';
    let inner  = await page.evaluate((sel)=>{
        let html = document.querySelector(sel).innerHTML;

        return html.replace(',','').replace('users','').trim()
    },NUM_USER_SELECTOR);

    const num = parseInt(inner);
    console.log('Number of users: ', num);

    return Math.ceil(num/10);
}

run();