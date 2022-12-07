const { Builder, By, Key, Capabilities, until } = require('selenium-webdriver');

const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();
options.addArguments("user-data-dir=/Users/aditya.sahu/Library/Application Support/Google/Chrome/Profile 1")
options.addArguments("profile-directory=Profile 1")


const fs = require('fs');

const data = 'write to a text file';

async function main() {

    var caps = new Capabilities();
    caps.setPageLoadStrategy('normal');

    // launch browser
    var driver = await new Builder().withCapabilities(caps).forBrowser('chrome').setChromeOptions(options).build();


    //navigate to webpage
    await driver.get('https://acceldata.okta.com/login/login.htm');

    //add search keyword
    await driver
        .findElement(By.id('okta-signin-username'))
        .sendKeys('aditya@acceldata.io');

    await driver
        .findElement(By.id('okta-signin-password'))
        .sendKeys('Aks@Mac@Ad@2201', Key.RETURN);


    setTimeout(async function () {
        const authXpath = '/html/body/div[2]/div/main/div[2]/div/div/form/div[1]/div[2]/div[1]/div[2]/span/input';
        await driver
            .findElement(By.xpath(authXpath))
            .sendKeys(Key.RETURN);

        fs.writeFile('output.txt', data, (err) => {
            if (err) {
                throw err;
            }
        })

        setTimeout(() => switchWindow(driver), 20000);

    }, 10000)

}

async function getTransitives(driver) {
    let results = [];
    const transitiveLinkSelector = '.F2 .gwt-Anchor';
    results = await driver.findElements(By.css(transitiveLinkSelector));

    for (const result of results) {
        const text = await result.getText();
        const tag = await result.getTagName();
        if (text === 'Transitive' && tag === 'a') {
            await result.click()
                .then(async (res) => {
                    const deps = await driver.findElements(By.css('.CY .gwt-Anchor'));
                    await driver.findElement(By.css('.gwt-DialogBox .gwt-Button')).click();
                    console.log('deps', deps);
                    return 1;

                }).catch(err => {
                    console.log('err', err);
                })

            // async function deps() {
            //     const deps = await driver.findElements(By.css('.CY .gwt-Anchor'));
            //     await driver.findElement(By.css('.gwt-DialogBox .gwt-Button')).click();
            //     console.log('deps', deps);
            // }
            // await deps();
        }
    }
    // results.forEach(async (result) => {

    // })

    if (!results.length) {
        console.log("running again");
        setTimeout(() => getTransitives(driver), 10000)
    }
}

async function switchWindow(driver) {
    const originalWindow = await driver.getWindowHandle();
    const windows = await driver.getAllWindowHandles();
    windows.forEach(async handle => {
        if (handle !== originalWindow) {
            driver.close();
            await driver.switchTo().window(handle);
            setTimeout(() => getTransitives(driver), 20000)
        }
    });
}

main();