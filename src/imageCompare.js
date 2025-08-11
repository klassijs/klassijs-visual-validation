// /**
//  * klassijs
//  * Copyright © 2016 - Larry Goddard
//
//  * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//  */
// require('dotenv').config();
// const resemble = require('klassijs-resembleJs');
// const fs = require('fs-extra');
//
// let diffFile;
// let browserName = BROWSER_NAME || global.browserName;
//
// const errors = [];
// let consoleOutput = '';
//
// const originalConsoleError = console.error;
// console.error = function (message) {
//   consoleOutput += message + '\n';
//   originalConsoleError.apply(console, arguments);
// };
//
// function throwCollectedErrors() {
//   if (errors.length > 0) {
//     const formattedErrorMessages = errors.map(err => {
//       return err.message;
//     }).join('\n');
//     const fullErrorMessage = `${formattedErrorMessages}`;
//     const cleanConsoleOutput = consoleOutput.replace(/\x1b\[[0-9;]*m/g, ''); // Remove color codes
//     const consoleMessage = `<div style="color:red;">${fullErrorMessage}</div>\n${cleanConsoleOutput}`;
//     if (cucumberThis && cucumberThis.attach) {
//       cucumberThis.attach(`Attachment (text/plain): ${consoleMessage}`);
//     }
//     throw new Error(consoleMessage);
//   }
// }
//
// class ImageAssertion {
//   constructor(filename, expected, result, value) {
//     this.filename = filename;
//     this.expected = expected;
//     this.result = result;
//     this.value = value;
//
//     // Bind methods to the instance
//     this.run = this.run.bind(this);
//     this.valueMethod = this.valueMethod.bind(this);
//     this.passMethod = this.passMethod.bind(this);
//   }
//
//   async run() {
//     const envName = env.envName.toLowerCase();
//     const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
//     const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
//     const resultDirPositive = `${resultDir}positive/`;
//     const resultDirNegative = `${resultDir}negative/`;
//     const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
//     const diffDirPositive = `${diffDir}positive/`;
//     const diffDirNegative = `${diffDir}negative/`;
//
//     const baselinePath = `${baselineDir}${this.filename}`;
//     const resultPathPositive = `${resultDirPositive}${this.filename}`;
//     fs.ensureDirSync(baselineDir);
//     fs.ensureDirSync(diffDirPositive);
//
//     if (!fs.existsSync(baselinePath)) {
//       console.info('\t WARNING: Baseline image does NOT exist.');
//       console.info(`\t Creating Baseline image from Result: ${baselinePath}`);
//       fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
//     }
//
//     resemble.outputSettings({
//       errorColor: {
//         red: 225,
//         green: 0,
//         blue: 225,
//       },
//       errorType: 'movement',
//       transparency: 0.1,
//       largeImageThreshold: 1200,
//     });
//
//     try {
//       resemble(baselinePath)
//         .compareTo(resultPathPositive)
//         .ignoreAntialiasing()
//         .ignoreColors()
//         .onComplete(async (res) => {
//           try {
//             this.result = await res;
//             await this.valueMethod(this.result, this.filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive);
//             await this.passMethod(this.result, this.filename, baselineDir, resultDirNegative, diffFile, this.value);
//           } catch (err) {
//             console.error('❌ \x1b[31mImage comparison failure:\x1b[0m', err.message);
//             errors.push({ error: err});
//           }
//         });
//     } catch (err) {
//       console.error(`❌ \x1b[31mError initiating image comparison:\x1b[0m`);
//       errors.push({ error: err});
//     }
//   }
//
//   async valueMethod(result, filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive) {
//     const resultPathNegative = `${resultDirNegative}${filename}`;
//     const resultPathPositive = `${resultDirPositive}${filename}`;
//     while (typeof result === 'undefined') {
//       await browser.pause(DELAY_100ms);
//     }
//     const error = parseFloat(result.misMatchPercentage);
//     fs.ensureDirSync(diffDirNegative);
//
//     if (error > this.expected) {
//       diffFile = `${diffDirNegative}${filename}`;
//       const writeStream = fs.createWriteStream(diffFile);
//       await result.getDiffImage().pack().pipe(writeStream);
//       writeStream.on('error', (err) => {
//         console.log('this is the writeStream error ', err);
//       });
//       fs.ensureDirSync(resultDirNegative);
//       fs.removeSync(resultPathNegative);
//       fs.copySync(resultPathPositive, resultPathNegative, false);
//       console.log(`\t Create diff image [negative]: ${diffFile}`);
//     } else {
//       diffFile = `${diffDirPositive}${filename}`;
//       const writeStream = fs.createWriteStream(diffFile);
//       result.getDiffImage().pack().pipe(writeStream);
//       writeStream.on('error', (err) => {
//         console.log('this is the writeStream error ', err);
//       });
//     }
//   }
//
//   async passMethod(result, filename, baselineDir, resultDirNegative, diffFile, value) {
//     value = parseFloat(result.misMatchPercentage);
//     this.message = `image Match Failed for ${filename} with a tolerance difference of ${value - this.expected} - expected: ${this.expected} but got: ${value}`;
//     const baselinePath = `${baselineDir}${filename}`;
//     const resultPathNegative = `${resultDirNegative}${filename}`;
//     const pass = value <= this.expected;
//     const err = value > this.expected;
//
//     if (pass) {
//       console.info(`✅ Image Match for ${filename} with ${value}% difference.`);
//     } else {
//       console.error(`\x1b[31m${this.message}\x1b[0m`);
//
//       if (cucumberThis && cucumberThis.attach) {
//         cucumberThis.attach(`<div style="color:red;">Match failed: ${this.message}</div>`, 'text/html');
//       }
//     }
//
//     const baselineImageUpdate = global.baselineImageUpdate;
//     if (!pass && baselineImageUpdate === true) {
//       console.info(
//         `${this.message}   images at:\n` +
//         `   Baseline: ${baselinePath}\n` +
//         `   Result: ${resultPathNegative}\n` +
//         `    cp ${resultPathNegative} ${baselinePath}`
//       );
//       await fs.copy(resultPathNegative, baselinePath, (err) => {
//         console.info(` All Baseline images have now been updated from: ${resultPathNegative}`);
//         if (err) {
//           console.error(`❌ The Baseline images were NOT updated: ${err.message}`);
//           errors.push({ message: this.message });
//         }
//       });
//     } else if (err) {
//       console.log(
//         `${this.message}   images at:\n` +
//         `   Baseline: ${baselinePath}\n` +
//         `   Result: ${resultPathNegative}\n` +
//         `   Diff: ${diffFile}\n` +
//         `   Open ${diffFile} to see how the image has changed.\n` +
//         '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
//         `    cp ${resultPathNegative} ${baselinePath}`
//       );
//       errors.push({ error: err });
//       throw `${err} - ${this.message}`;
//     }
//   }
//
//   static finalizeTest() {
//     if (errors.length > 0) {
//       throwCollectedErrors();
//       console.error('❌ Test run completed with failures...');
//     } else {
//       console.log('✅ Test run completed successfully...');
//     }
//   }
// }
//
// // takePageImage function to take a screenshot of the page
// async function takePageImage(filename, elementSnapshot = null, elementsToHide = null) {
//   const envName = env.envName.toLowerCase();
//   const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
//   const resultDirPositive = `${resultDir}positive/`;
//
//   if (elementsToHide) {
//     await hideElements(elementsToHide);
//   }
//
//   fs.ensureDirSync(resultDirPositive);
//   const resultPathPositive = `${resultDirPositive}${filename}`;
//
//   if (elementSnapshot) {
//     let elem = await browser.$(elementSnapshot);
//     await elem.saveScreenshot(resultPathPositive, async (err) => {
//       await timeoutErrormsg(err);
//     });
//   } else {
//     await browser.saveScreenshot(resultPathPositive, async (err) => {
//       await timeoutErrormsg(err);
//     });
//   }
//
//   if (elementsToHide) {
//     await showElements(elementsToHide);
//   }
//   console.log(`\t images saved to: ${resultPathPositive}`);
// }
//
// async function timeoutErrormsg(err) {
//   await browser.pause(DELAY_500ms);
//   if (err) {
//     console.error(err.message);
//   }
// }
//
// /**
//  * hideElemements hide elements
//  * @param selectors
//  */
// async function hideElements(selectors) {
//   // if arg is not an array make it one
//   selectors = typeof selectors === 'string' ? [selectors] : selectors;
//   for (let i = 0; i < selectors.length; i++) {
//     const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
//     await browser.execute(script);
//   }
// }
//
// /**
//  * showElemements show elements
//  * @param selectors
//  */
// async function showElements(selectors){
//   // if arg is not an array make it one
//   selectors = typeof selectors === 'string' ? [selectors] : selectors;
//   for (let i = 0; i < selectors.length; i++) {
//     const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
//     await browser.execute(script);
//   }
// }
//
// module.exports = {
//   takePageImage,
//   ImageAssertion
// };


/**
 * Copyright © 2016 klassijs - Larry Goddard
 */
const fs = require('fs-extra');
const env = require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const browserName = process.env.BROWSER || 'chrome';
const DELAY_500ms = 500;

let errors = [];

/**
 * ImageAssertion class for visual regression testing
 */
class ImageAssertion {
  constructor(filename, expected, result, value) {
    this.filename = filename;
    this.expected = expected;
    this.result = result;
    this.value = value;
    this.message = `Visual regression test failed for ${filename}`;
  }

  async run() {
    const envName = env.envName.toLowerCase();
    const baselineDir = `./visual-regression-baseline/${browserName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;
    const diffDir = `./artifacts/visual-regression/diff/${browserName}/${envName}/`;

    const baselinePath = `${baselineDir}${this.filename}`;
    const resultPathPositive = `${resultDirPositive}${this.filename}`;
    const resultPathNegative = `${resultDirNegative}${this.filename}`;
    const diffFile = `${diffDir}${this.filename}`;

    // Create directories if they don't exist
    fs.ensureDirSync(baselineDir);
    fs.ensureDirSync(resultDirNegative);
    fs.ensureDirSync(diffDir);

    // Check if baseline image exists
    if (!fs.existsSync(baselinePath)) {
      console.log(`Baseline image not found for ${this.filename}, creating baseline...`);
      fs.copySync(resultPathPositive, baselinePath);
      console.log(`Baseline image created: ${baselinePath}`);
      return;
    }

    // Compare images using ImageMagick
    try {
      const compareCommand = `compare -metric AE -fuzz ${this.expected * 100}% "${baselinePath}" "${resultPathPositive}" "${diffFile}" 2>&1`;
      const compareResult = execSync(compareCommand, { encoding: 'utf8' });
      const difference = parseFloat(compareResult);

      if (difference <= this.expected) {
        await this.passMethod(difference, this.filename, baselineDir, resultDirNegative, diffFile, this.value);
      } else {
        await this.valueMethod(difference, this.filename, resultDirNegative, resultDirPositive, diffDir, this.value);
      }
    } catch (error) {
      console.error(`Image comparison failed: ${error.message}`);
      errors.push({ error: error.message });
    }
  }

  async valueMethod(result, filename, resultDirNegative, resultDirPositive, diffDirNegative, value) {
    const envName = env.envName.toLowerCase();
    const baselineDir = `./visual-regression-baseline/${browserName}/`;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const diffFile = `${diffDirNegative}${filename}`;

    fs.copySync(resultPathPositive, resultPathNegative);

    if (result <= value) {
      console.log(
        `${this.message} - Difference: ${result} (within tolerance: ${value})\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `   Diff: ${diffFile}`
      );
    } else {
      console.log(
        `${this.message} - Difference: ${result} (exceeds tolerance: ${value})\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `   Diff: ${diffFile}\n` +
        `   Open ${diffFile} to see how the image has changed.\n` +
        '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
        `    cp ${resultPathNegative} ${baselinePath}`
      );
      errors.push({ message: this.message });
    }
  }

  async passMethod(result, filename, baselineDir, resultDirNegative, diffFile, value) {
    const envName = env.envName.toLowerCase();
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathNegative = `${resultDirNegative}${filename}`;

    if (result === 0) {
      console.log(`✅ Visual regression test passed for ${filename} - No differences detected`);
    } else {
      console.log(`✅ Visual regression test passed for ${filename} - Difference: ${result} (within tolerance: ${value})`);
    }

    // Clean up temporary files
    if (fs.existsSync(resultPathNegative)) {
      fs.removeSync(resultPathNegative);
    }
    if (fs.existsSync(diffFile)) {
      fs.removeSync(diffFile);
    }
  }

  static updateBaseline() {
    const envName = env.envName.toLowerCase();
    const baselineDir = `./visual-regression-baseline/${browserName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirNegative = `${resultDir}negative/`;

    if (!fs.existsSync(resultDirNegative)) {
      console.log('No failed visual regression tests to update baseline from.');
      return;
    }

    const failedImages = fs.readdirSync(resultDirNegative);
    if (failedImages.length === 0) {
      console.log('No failed visual regression tests to update baseline from.');
      return;
    }

    console.log(`Updating baseline images from ${failedImages.length} failed tests...`);

    failedImages.forEach((image) => {
      const baselinePath = `${baselineDir}${image}`;
      const resultPathNegative = `${resultDirNegative}${image}`;

      fs.copySync(resultPathNegative, baselinePath, (err) => {
        console.info(` All Baseline images have now been updated from: ${resultPathNegative}`);
        if (err) {
          console.error(`❌ The Baseline images were NOT updated: ${err.message}`);
          errors.push({ message: this.message });
        }
      });
    });
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

  // Log WebDriver mode for debugging
  const webDriverMode = browser.isW3C ? 'W3C' : 'Classic';
  console.log(`\t WebDriver running in ${webDriverMode} mode`);

  try {
    if (elementSnapshot) {
      let elem = await browser.$(elementSnapshot);
      // Check WebDriver mode for element screenshots
      if (browser.isW3C) {
        // W3C mode - use the normal saveScreenshot with callback
        console.log(`\t Taking element screenshot using W3C mode with callback`);
        await elem.saveScreenshot(resultPathPositive, async (err) => {
          await timeoutErrormsg(err);
        });
      } else {
        // Classic mode - use saveScreenshot without callback
        console.log(`\t Taking element screenshot using Classic mode without callback`);
        await elem.saveScreenshot(resultPathPositive);
      }
    } else {
      // Check WebDriver mode for page screenshots
      if (browser.isW3C) {
        // W3C mode - use the normal saveScreenshot with callback
        console.log(`\t Taking page screenshot using W3C mode with callback`);
        await browser.saveScreenshot(resultPathPositive, async (err) => {
          await timeoutErrormsg(err);
        });
      } else {
        // Classic mode - use saveScreenshot without callback
        console.log(`\t Taking page screenshot using Classic mode without callback`);
        await browser.saveScreenshot(resultPathPositive);
      }
    }
  } catch (error) {
    // If the primary method fails, try fallback approach
    console.warn(`Primary screenshot method failed (${error.message}), attempting fallback...`);

    try {
      if (elementSnapshot) {
        let elem = await browser.$(elementSnapshot);
        // Fallback: try without callback for Classic mode
        console.log(`\t Attempting fallback element screenshot without callback`);
        await elem.saveScreenshot(resultPathPositive);
      } else {
        // Fallback: try without callback for Classic mode
        console.log(`\t Attempting fallback page screenshot without callback`);
        await browser.saveScreenshot(resultPathPositive);
      }
      console.log(`\t Fallback screenshot method succeeded`);
    } catch (fallbackError) {
      console.error(`Screenshot failed in both W3C and Classic modes: ${fallbackError.message}`);
      throw new Error(`Unable to take screenshot: ${fallbackError.message}`);
    }
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
  selectors = typeof selectors === 'string' ? [selectors] : selectals;
  for (let i = 0; i < selectors.length; i++) {
    const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
    await browser.execute(script);
  }
}

module.exports = {
  takePageImage,
  ImageAssertion
};
