/**
 * klassijs
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
require('dotenv').config();
const resemble = require('klassijs-resembleJs');
const fs = require('fs-extra');

let diffFile;
let browserName = BROWSER_NAME || global.browserName;

const errors = [];
let consoleOutput = '';

const originalConsoleError = console.error;
console.error = function (message) {
  consoleOutput += message + '\n';
  originalConsoleError.apply(console, arguments);
};

function throwCollectedErrors() {
  if (errors.length > 0) {
    const formattedErrorMessages = errors.map(err => {
      return err.message;
    }).join('\n');
    const fullErrorMessage = `${formattedErrorMessages}`;
    const cleanConsoleOutput = consoleOutput.replace(/\x1b\[[0-9;]*m/g, ''); // Remove color codes
    const consoleMessage = `<div style="color:red;">${fullErrorMessage}</div>\n${cleanConsoleOutput}`;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`Attachment (text/plain): ${consoleMessage}`);
    }
    throw new Error(consoleMessage);
  }
}

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
    const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;
    const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
    const diffDirPositive = `${diffDir}positive/`;
    const diffDirNegative = `${diffDir}negative/`;

    const fileName = this.filename;
    const baselinePath = `${baselineDir}${this.filename}`;
    const resultPathPositive = `${resultDirPositive}${this.filename}`;
    fs.ensureDirSync(baselineDir);
    fs.ensureDirSync(diffDirPositive);

    if (!fs.existsSync(baselinePath)) {
      console.info('\t WARNING: Baseline image does NOT exist.');
      console.info(`\t Creating Baseline image from Result: ${baselinePath}`);
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
            await this.valueMethod(this.result, this.filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive);
            await this.passMethod(this.result, this.filename, baselineDir, resultDirNegative, diffFile, this.value);
          } catch (err) {
            console.error('❌ \x1b[31mImage comparison failure:\x1b[0m', err.message);
            errors.push({ error: err});
          }
        });
    } catch (err) {
      console.error(`❌ \x1b[31mError initiating image comparison:\x1b[0m`);
      errors.push({ error: err});
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
      fs.copySync(resultPathPositive, resultPathNegative, false);
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
      console.info(`✅ Image Match for ${filename} with ${value}% difference.`);
    } else {
      console.error(`\x1b[31m${this.message}\x1b[0m`);

      if (cucumberThis && cucumberThis.attach) {
        cucumberThis.attach(`<div style="color:red;">Match failed: ${this.message}</div>`, 'text/html');
      }
    }

    const baselineImageUpdate = global.baselineImageUpdate;
    if (!pass && baselineImageUpdate === true) {
      console.info(
        `${this.message}   images at:\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `    cp ${resultPathNegative} ${baselinePath}`
      );
      await fs.copy(resultPathNegative, baselinePath, (err) => {
        console.info(` All Baseline images have now been updated from: ${resultPathNegative}`);
        if (err) {
          console.error(`❌ The Baseline images were NOT updated: ${err.message}`);
          errors.push({ message: this.message });
        }
      });
    } else if (err) {
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
      errors.push({ error: err });
    }
  }

  static finalizeTest() {
    if (errors.length > 0) {
      throwCollectedErrors();
      console.error('❌ Test run completed with failures...');
    } else {
      console.log('✅ Test run completed successfully...');
    }
  }
}


// takePageImage function to take a screenshot of the page
async function takePageImage(filename, elementSnapshot = null, elementsToHide = null) {
  const envName = env.envName.toLowerCase();
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
