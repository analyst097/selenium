const { Builder, By, Key, Capabilities, until } = require('selenium-webdriver');

const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();
// options.addArguments("user-data-dir=/Users/aditya.sahu/Library/Application Support/Google/Chrome/Profile 1")
// options.addArguments("profile-directory=Profile 1")

const fs = require('fs');

var allRowsSelector = 'td.FIB tr.EK, td.FIB tr.DL';

async function main() {

    const caps = new Capabilities();
    caps.setPageLoadStrategy('normal');

    // launch browser
    const driver = await new Builder().withCapabilities(caps).forBrowser(
        'chrome').build();

    //navigate to webpage
    await driver.get('https://saas-eu.whitesourcesoftware.com/Wss/WSS.html#!product;id=288863');

    //add search keyword
    setTimeout(async () => {
        await driver.findElement(By.xpath('/html/body/div[4]/table/tbody/tr[2]/td/div[2]/table/tbody/tr/td[1]/table/tbody/tr[9]/td/a')).click();

        await driver
            .findElement(By.xpath('/html/body/div[4]/table/tbody/tr[2]/td/div[3]/table/tbody/tr/td/table/tbody/tr[4]/td/input'))
            .sendKeys('aditya@acceldata.io');

        await driver.findElement(By.xpath('/html/body/div[4]/table/tbody/tr[2]/td/div[3]/table/tbody/tr/td/table/tbody/tr[6]/td/button')).click();

        setTimeout(async function () {
            await driver
                .findElement(By.id('okta-signin-username'))
                .sendKeys('');

            await driver
                .findElement(By.id('okta-signin-password'))
                .sendKeys('', Key.RETURN);

            fs.writeFile('output.txt', '', (err) => {
                console.log(err);
            });

            setTimeout(async () => {

                const recordsXpath = '/html/body/div[7]/div[1]/div/div[3]/div/div/table/tbody/tr/td/div/div/table/tbody/tr[3]/td/div[2]/div/div[4]/table/tbody/tr/td[3]/div';
                const el = await driver.findElement(By.xpath(recordsXpath));
                const elTxt = await el.getText();
                const totalRows = +elTxt.split('of')[1].trim();
                console.log(totalRows);
                var iterations = Math.floor(totalRows / 100);

                getTransitives(driver, iterations)
            }, 30000);

        }, 3000)


    }, 6000)

}

async function getTransitives(driver, iterations) {
    let results = [];

    const transitiveLinkSelector = '.F2 .gwt-Anchor';
    results = await driver.findElements(By.css(transitiveLinkSelector));
    if (!results.length) {
        console.log("done");
    }
    for (const result of results) {
        const text = await result.getText();
        const tag = await result.getTagName();
        if (text === 'Transitive' && tag === 'a') {
            const asd = await getDependencyName(result, driver);
        }
    }

    if (iterations > 0) {
        const nextPageSelector = 'img[aria-label=\"Next page\"]'
        await driver.findElement(By.css(nextPageSelector)).click();
        setTimeout(async () => {
            getTransitives(driver, --iterations);
        }, 3000);
    }

}

async function getDependencyName(result, driver) {
    return new Promise(async (resolve, reject) => {
        try {
            await result.click()
            setTimeout(async () => {
                const deps = await driver.findElements(By.css('.CY .gwt-Anchor'));
                for (const d of deps) {
                    const dep = await d.getText();
                    console.log('deps', dep);
                    fs.appendFile('output.txt', dep + '\n', (err) => {
                        if (err) {
                            throw err;
                        }
                    })
                }

                await driver.findElement(By.css('.gwt-DialogBox .gwt-Button')).click();

                resolve(1);
            }, 2000)

        } catch (e) {
            reject(e);
        }

    });
}



main();
