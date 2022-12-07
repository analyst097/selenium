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
    results.forEach(async (result) => {
        result.click();
        let deps = await driver.wait(until.elementLocated(By.css('.CY .gwt-Anchor')), 30000, 'Timed out after 30 seconds', 5000);
        console.log(deps);
    })

    console.log('result: ', results);
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