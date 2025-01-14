/**
 * Copyright © 2016 klassijs - Larry Goddard
 */
require('dotenv').config();
const resemble = require('klassijs-resembleJs');
const fs = require('fs-extra');
const { astellen } = require('klassijs-astellen');

let diffFile;

class ImageAssertion {
  constructor(filename, expected, result, value) {
    this.filename = filename;
    this.expected = expected;
    this.result = result;
    this.value = value;

    // Bind methods to the instance
    this.run = this.run.bind(this);
    this.valueMethod = this.valueMethod.bind(this);
    this.passMethod = this.passMethod.bind(this);
  }

  async run() {
    const envName = env.envName.toLowerCase();
    const browserName = astellen.get('BROWSER_NAME');
    const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;

    const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
    const diffDirPositive = `${diffDir}positive/`;
    const diffDirNegative = `${diffDir}negative/`;

    const fileName = this.filename;
    const baselinePath = `${baselineDir}${fileName}`;
    const resultPathPositive = `${resultDirPositive}${fileName}`;
    fs.ensureDirSync(baselineDir);
    fs.ensureDirSync(diffDirPositive);

    if (!fs.existsSync(baselinePath)) {
      console.log('\t WARNING: Baseline image does NOT exist.');
      console.log(`\t Creating Baseline image from Result: ${baselinePath}`);
      fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
    }

    resemble.outputSettings({
      errorColor: {
        red: 225,
        green: 0,
        blue: 225,
      },
      errorType: 'movement',
      transparency: 0.1,
      largeImageThreshold: 1200,
    });

    try {
      resemble(baselinePath)
        .compareTo(resultPathPositive)
        .ignoreAntialiasing()
        .ignoreColors()
        .onComplete(async (res) => {
          try {
            this.result = await res;
            await this.valueMethod(this.result, fileName, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive);
            await this.passMethod(this.result, fileName, baselineDir, resultDirNegative, diffFile, this.value);
          } catch (err) {
            console.error('Error during image comparison:', err);
          }
        });
    } catch (err) {
      console.error('Error initiating image comparison:', err);
    }
  }

  async valueMethod(result, filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive) {
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    while (typeof result === 'undefined') {
      await browser.pause(DELAY_100ms);
    }
    const error = parseFloat(result.misMatchPercentage);
    fs.ensureDirSync(diffDirNegative);

    if (error > this.expected) {
      diffFile = `${diffDirNegative}${filename}`;
      const writeStream = fs.createWriteStream(diffFile);
      await result.getDiffImage().pack().pipe(writeStream);
      writeStream.on('error', (err) => {
        console.log('this is the writeStream error ', err);
      });
      fs.ensureDirSync(resultDirNegative);
      fs.removeSync(resultPathNegative);
      fs.moveSync(resultPathPositive, resultPathNegative, false);
      console.log(`\t Create diff image [negative]: ${diffFile}`);
    } else {
      diffFile = `${diffDirPositive}${filename}`;
      const writeStream = fs.createWriteStream(diffFile);
      result.getDiffImage().pack().pipe(writeStream);
      writeStream.on('error', (err) => {
        console.log('this is the writeStream error ', err);
      });
    }
  }

  async passMethod(result, filename, baselineDir, resultDirNegative, diffFile, value) {
    value = parseFloat(result.misMatchPercentage);
    this.message = `image Match Failed for ${filename} with a tolerance difference of ${value - this.expected} - expected: ${this.expected} but got: ${value}`;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const pass = value <= this.expected;
    const err = value > this.expected;

    if (pass) {
      console.log(`image Match for ${filename} with ${value}% difference.`);
      await browser.pause(DELAY_1s);
    }

    const baselineImageUpdate = astellen.get('baselineImageUpdate');
    if (err === true && baselineImageUpdate === true) {
      console.log('Condition met: err is true and options.updateBaselineImage is', baselineImageUpdate);
      console.log(
        `${this.message}   images at:\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `    cp ${resultPathNegative} ${baselinePath}`
      );
      await fs.copy(resultPathNegative, baselinePath, (err) => {
        console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
        if (err) {
          console.error('The Baseline images were NOT updated: ', err.message);
          throw err;
        }
      });
    } else if (err) {
      console.log('Condition not met: err is', err, 'and options.updateBaselineImage is', baselineImageUpdate);
      console.log(
        `${this.message}   images at:\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `   Diff: ${diffFile}\n` +
        `   Open ${diffFile} to see how the image has changed.\n` +
        '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
        `    cp ${resultPathNegative} ${baselinePath}`
      );
      throw `${err} - ${this.message}`;
    }
  }
}

async function takePageImage(filename, elementSnapshot = null, elementsToHide = null) {
  const envName = env.envName.toLowerCase();
  const browserName = astellen.get('BROWSER_NAME');
  const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
  const resultDirPositive = `${resultDir}positive/`;

  if (elementsToHide) {
    await hideElements(elementsToHide);
  }

  fs.ensureDirSync(resultDirPositive);
  const resultPathPositive = `${resultDirPositive}${filename}`;

  if (elementSnapshot) {
    let elem = await browser.$(elementSnapshot);
    await elem.saveScreenshot(resultPathPositive, async (err) => {
      await timeoutErrormsg(err);
    });
  } else {
    await browser.saveScreenshot(resultPathPositive, async (err) => {
      await timeoutErrormsg(err);
    });
  }

  if (elementsToHide) {
    await showElements(elementsToHide);
  }
  console.log(`\t images saved to: ${resultPathPositive}`);
}

async function timeoutErrormsg(err) {
  await browser.pause(DELAY_500ms);
  if (err) {
    console.error(err.message);
  }
}

/**
 * hideElemements hide elements
 * @param selectors
 */
async function hideElements(selectors) {
  // if arg is not an array make it one
  selectors = typeof selectors === 'string' ? [selectors] : selectors;
  for (let i = 0; i < selectors.length; i++) {
    const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
    await browser.execute(script);
  }
}

/**
 * showElemements show elements
 * @param selectors
 */
async function showElements(selectors){
  // if arg is not an array make it one
  selectors = typeof selectors === 'string' ? [selectors] : selectors;
  for (let i = 0; i < selectors.length; i++) {
    const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
    await browser.execute(script);
  }
}

module.exports = {
  takePageImage,
  ImageAssertion
};
