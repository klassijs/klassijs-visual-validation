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

const DELAY_100ms = 100;
const DELAY_500ms = 500;

const errors = [];
let consoleOutput = '';

const originalConsoleError = console.error;
console.error = function (message) {
  consoleOutput += message + '\n';
  originalConsoleError.apply(console, arguments);
};

/**
 * This ensures a clean errors array for the entire test run
 */
function startNewTestRun() {
  clearErrors();
}

/**
 * This ensures test isolation and prevents errors from carrying over
 */
function clearErrors() {
  errors.length = 0;
  consoleOutput = '';
}

/**
 * Take screenshot using W3C mode only
 * @param {string} resultPathPositive - Path to save the screenshot
 * @param {string} elementSelector - CSS selector for element screenshot (optional)
 * @returns {Promise<void>}
 */
async function takeScreenshotImage(resultPathPositive, elementSelector = null) {
  try {
    if (elementSelector) {
      // Element screenshot using W3C mode
      // Use direct Promise-based approach for WebdriverIO v9+
      let elem = await browser.$(elementSelector);
      await elem.saveScreenshot(resultPathPositive);
    } else {
      // Page screenshot using W3C mode
      // Use direct Promise-based approach for WebdriverIO v9+
      await browser.saveScreenshot(resultPathPositive);
    }
  } catch (error) {
    console.error(`Screenshot failed: ${error.message}`);
    throw new Error(`Unable to take screenshot: ${error.message}`);
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
      return errObj && typeof errObj === 'string' ? errObj : 
             errObj && typeof errObj === 'number' ? `Error code: ${errObj}` : 
             'Unknown error occurred';
    }).join('\n');
    
    // Only include the essential error messages
    const consoleMessage = `<div style="color:red;">${formattedErrorMessages}</div>`;
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
      // Only log to console, don't clutter Cucumber report
      console.info(`Baseline image created: ${baselinePath}`);
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
            const errorMessage = err && typeof err === 'object' && err.message ? err.message : 
                               err && typeof err === 'string' ? err : 
                               err && typeof err === 'number' ? `Error code: ${err}` : 
                               'Unknown error occurred';
            
            // log to console, don't clutter report
            console.error('Image comparison failure:', errorMessage);
            errors.push({ error: err, message: errorMessage });
          }
        });
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && err.message ? err.message : 
                         err && typeof err === 'string' ? err : 
                         err && typeof err === 'number' ? `Error code: ${err}` : 
                         'Unknown error occurred';
      console.error(`Error initiating image comparison: ${errorMessage}`);
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
        console.error('WriteStream error:', err.message);
      });
      fs.ensureDirSync(resultDirNegative);
      fs.removeSync(resultPathNegative);
      fs.copySync(resultPathPositive, resultPathNegative, false);
      // Only log to console, don't clutter Cucumber report
      console.info(`Diff image created: ${diffFile}`);
    } else {
      diffFile = `${diffDirPositive}${filename}`;
      const writeStream = fs.createWriteStream(diffFile);
      result.getDiffImage().pack().pipe(writeStream);
      writeStream.on('error', (err) => {
        console.error('WriteStream error:', err.message);
      });
    }
  }

  async passMethod(result, filename, baselineDir, resultDirNegative, diffFile, value) {
    value = parseFloat(result.misMatchPercentage);
    this.message = `image Match Failed for ${filename} with a tolerance difference of ${value - this.expected} - expected: ${this.expected} but got: ${value}`;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const pass = value <= this.expected;

    if (pass) {
      console.info(`Image match passed: ${filename} with ${value}% difference`);
    } else {
      console.error(`Image match failed: ${this.message}`);
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
        console.info(`Baseline images updated from: ${resultPathNegative}`);
        if (err) {
          const errorMessage = err && typeof err === 'object' && err.message ? err.message : 
                             err && typeof err === 'string' ? err : 
                             err && typeof err === 'number' ? `Error code: ${err}` : 
                             'Unknown error occurred';
          console.error(`Baseline images update failed: ${errorMessage}`);
          errors.push({ error: err, message: errorMessage });
        }
      });
    } else if (!pass) {
      console.info(`Test failed: ${this.message}`);
      console.info(`Baseline: ${baselinePath}`);
      console.info(`Result: ${resultPathNegative}`);
      console.info(`Diff: ${diffFile}`);
      errors.push({ error: 'Image comparison failed', message: this.message });
    }
  }

  static finalizeTest() {
    if (errors.length > 0) {
      throwCollectedErrors();
      console.error('Test run completed with failures');
    } else {
      console.log('Test run completed successfully');
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
    await takeScreenshotImage(resultPathPositive, elementSnapshot);
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
  console.info(`Screenshot saved: ${resultPathPositive}`);
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
  ImageAssertion,
  clearErrors,
  startNewTestRun
};
