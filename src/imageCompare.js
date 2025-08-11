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

// Constants for delays
const DELAY_100ms = 100;
const DELAY_500ms = 500;

/**
 * Wrapper function to add timeout to any async operation
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation for error messages
 * @returns {Promise}
 */
function withTimeout(promise, timeoutMs, operationName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

const errors = [];
let consoleOutput = '';

const originalConsoleError = console.error;
console.error = function (message) {
  consoleOutput += message + '\n';
  originalConsoleError.apply(console, arguments);
};

/**
 * Detect WebDriver mode (W3C or Classic)
 * @returns {string} 'W3C' or 'Classic'
 */
function detectWebDriverMode() {
  try {
    // Check if browser object exists and has isW3C property
    if (typeof browser !== 'undefined' && browser.isW3C !== undefined) {
      return browser.isW3C ? 'W3C' : 'Classic';
    }

    // Fallback: check for W3C capabilities
    if (typeof browser !== 'undefined' && browser.capabilities) {
      // Check for W3C capabilities
      if (browser.capabilities['webdriver.remote.sessionid'] ||
        browser.capabilities['ms:edgeOptions'] ||
        browser.capabilities['goog:chromeOptions']) {
        return 'W3C';
      }
    }

    // Default to Classic if we can't determine
    console.warn('Could not determine WebDriver mode, defaulting to Classic');
    return 'Classic';
  } catch (error) {
    console.warn(`Error detecting WebDriver mode: ${error.message}, defaulting to Classic`);
    return 'Classic';
  }
}

/**
 * Take screenshot with proper WebDriver mode handling
 * @param {string} resultPathPositive - Path to save the screenshot
 * @param {string} elementSelector - CSS selector for element screenshot (optional)
 * @returns {Promise<void>}
 */
async function takeScreenshotWithModeDetection(resultPathPositive, elementSelector = null) {
  const webDriverMode = detectWebDriverMode();
  console.log(`\t WebDriver running in ${webDriverMode} mode`);

  try {
    if (elementSelector) {
      // Element screenshot
      let elem = await browser.$(elementSelector);

      if (webDriverMode === 'W3C') {
        // W3C mode - try multiple approaches
        console.log(`\t Taking element screenshot using W3C mode`);

        try {
          // First try: direct method (some W3C implementations work better with this)
          console.log(`\t Trying direct method first...`);
          await withTimeout(elem.saveScreenshot(resultPathPositive), 15000, 'Element screenshot');
          console.log(`\t Direct method succeeded`);
        } catch (directError) {
          console.log(`\t Direct method failed, trying callback approach: ${directError.message}`);

          // Second try: callback approach with timeout
          try {
            await Promise.race([
              new Promise((resolve, reject) => {
                elem.saveScreenshot(resultPathPositive, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Screenshot timeout')), 10000)
              )
            ]);
            console.log(`\t Callback approach succeeded`);
          } catch (callbackError) {
            console.log(`\t Callback approach also failed: ${callbackError.message}`);
            throw directError; // Throw the original error
          }
        }
      } else {
        // Classic mode - use saveScreenshot without callback
        console.log(`\t Taking element screenshot using Classic mode without callback`);
        await elem.saveScreenshot(resultPathPositive);
      }
    } else {
      // Page screenshot
      if (webDriverMode === 'W3C') {
        // W3C mode - try multiple approaches
        console.log(`\t Taking page screenshot using W3C mode`);

        try {
          // First try: direct method (some W3C implementations work better with this)
          console.log(`\t Trying direct method first...`);
          await withTimeout(browser.saveScreenshot(resultPathPositive), 15000, 'Page screenshot');
          console.log(`\t Direct method succeeded`);
        } catch (directError) {
          console.log(`\t Direct method failed, trying callback approach: ${directError.message}`);

          // Second try: callback approach with timeout
          try {
            await Promise.race([
              new Promise((resolve, reject) => {
                browser.saveScreenshot(resultPathPositive, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Screenshot timeout')), 10000)
              )
            ]);
            console.log(`\t Callback approach succeeded`);
          } catch (callbackError) {
            console.log(`\t Callback approach also failed: ${callbackError.message}`);
            throw directError; // Throw the original error
          }
        }
      } else {
        // Classic mode - use saveScreenshot without callback
        console.log(`\t Taking page screenshot using Classic mode without callback`);
        await browser.saveScreenshot(resultPathPositive);
      }
    }

    console.log(`\t Screenshot taken successfully using ${webDriverMode} mode`);
  } catch (error) {
    console.warn(`Primary screenshot method failed (${error.message}), attempting fallback...`);

    // Fallback: try alternative approach
    try {
      if (elementSelector) {
        let elem = await browser.$(elementSelector);
        console.log(`\t Attempting fallback element screenshot`);
        await elem.saveScreenshot(resultPathPositive);
      } else {
        console.log(`\t Attempting fallback page screenshot`);
        await browser.saveScreenshot(resultPathPositive);
      }
      console.log(`\t Fallback screenshot method succeeded`);
    } catch (fallbackError) {
      console.error(`Screenshot failed in both W3C and Classic modes: ${fallbackError.message}`);
      throw new Error(`Unable to take screenshot: ${fallbackError.message}`);
    }
  }
}

function throwCollectedErrors() {
  if (errors.length > 0) {
    const formattedErrorMessages = errors.map(errObj => {
      // Handle different error object structures
      if (errObj && typeof errObj === 'object') {
        if (errObj.message) {
          return errObj.message;
        } else if (errObj.error) {
          // Handle the case where we have { error: err, message: errorMessage }
          if (typeof errObj.error === 'string') {
            return errObj.error;
          } else if (errObj.error && typeof errObj.error === 'object' && errObj.error.message) {
            return errObj.error.message;
          }
        }
      }
      // Fallback for other error types
      return errObj && typeof errObj === 'string' ? errObj :
        errObj && typeof errObj === 'number' ? `Error code: ${errObj}` :
          'Unknown error occurred';
    }).join('\n');
    const fullErrorMessage = `${formattedErrorMessages}`;
    const cleanConsoleOutput = consoleOutput.replace(/\x1b\[[0-9;]*m/g, ''); // Remove color codes
    const consoleMessage = `<div style="color:red;">${fullErrorMessage}</div>\n${cleanConsoleOutput}`;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`Attachment (text/plain): ${consoleMessage}`);
    }
    errors.length = 0;
    throw new Error(consoleMessage);
  }
}

/**
 * ImageAssertion class for visual regression testing
 */
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
            // Handle different types of errors properly
            const errorMessage = err && typeof err === 'object' && err.message ? err.message :
              err && typeof err === 'string' ? err :
                err && typeof err === 'number' ? `Error code: ${err}` :
                  'Unknown error occurred';

            console.error('❌ \x1b[31mImage comparison failure:\x1b[0m', errorMessage);
            errors.push({ error: err, message: errorMessage });
          }
        });
    } catch (err) {
      // Handle different types of errors properly
      const errorMessage = err && typeof err === 'object' && err.message ? err.message :
        err && typeof err === 'string' ? err :
          err && typeof err === 'number' ? `Error code: ${err}` :
            'Unknown error occurred';

      console.error(`❌ \x1b[31mError initiating image comparison:\x1b[0m ${errorMessage}`);
      errors.push({ error: err, message: errorMessage });
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
          const errorMessage = err && typeof err === 'object' && err.message ? err.message :
            err && typeof err === 'string' ? err :
              err && typeof err === 'number' ? `Error code: ${err}` :
                'Unknown error occurred';
          console.error(`❌ The Baseline images were NOT updated: ${errorMessage}`);
          errors.push({ error: err, message: errorMessage });
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
      errors.push({ error: err, message: `${err} - ${this.message}` });
      throw `${err} - ${this.message}`;
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

  try {
    // Use the new mode-aware screenshot function
    await takeScreenshotWithModeDetection(resultPathPositive, elementSnapshot);
  } catch (error) {
    const errorMessage = error && typeof error === 'object' && error.message ? error.message :
      error && typeof error === 'string' ? error :
        error && typeof error === 'number' ? `Error code: ${error}` :
          'Unknown error occurred';
    console.error(`Failed to take screenshot: ${errorMessage}`);
    throw error;
  }

  if (elementsToHide) {
    await showElements(elementsToHide);
  }
  console.log(`\t images saved to: ${resultPathPositive}`);
}

async function timeoutErrormsg(err) {
  await browser.pause(DELAY_500ms);
  if (err) {
    const errorMessage = err && typeof err === 'object' && err.message ? err.message :
      err && typeof err === 'string' ? err :
        err && typeof err === 'number' ? `Error code: ${err}` :
          'Unknown error occurred';
    console.error(errorMessage);
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
