/**
 * klassijs
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const resemble = require('klassijs-resembleJs');
const fs = require('fs-extra');
const program = require('commander');
const path = require('path');

program
    .option('--updateBaselineImage', 'automatically update the baseline image after a failed comparison', false)
    .parse(process.argv);
// console.log('this is inside the module 1 =====>>>>>>>>> ', program.opts());

// const options = program.opts();
// const settings = {
//   updateBaselineImage: options.updateBaselineImage,
// };
// console.log('this is inside the module =====>>>>>>>>> ', process.argv)

const envName = env.envName.toLowerCase();
const browserName = settings.remoteConfig || BROWSER_NAME

let fileName = [];
let diffFile;
let resolutions = [
  {width: 1280, height:1024},
  {width: 1740, height: 1024},
  {width: 450, height: 800},
  {width: 756, height: 1080}
]

let resultString;
// let resultDirNegative;
// let resultDirPositive;

// Function to convert an object to the desired string format
function objectToString(obj) {
  return Object.entries(obj)
      .map(([key, value]) => `${key}-${value}`)
      .join('-');
}

const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
const resultDirPositive = `${resultDir}positive/`;
const resultDirNegative = `${resultDir}negative/`;
const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
const diffDirPositive = `${diffDir}positive/`;
const diffDirNegative = `${diffDir}negative/`;


module.exports = {
  /**
   * Take an image of the current page and saves it as the given filename.
   * @method saveScreenshot
   * @param {string} filename The complete path to the file name where the image should be saved.
   * @param elementsToHide
   * @param filename
   * @param elementSnapshot
   * @param resolutions
   * @returns {Promise<void>}
   */
  // takePageImage: async (filename, elementSnapshot, elementsToHide, resolutions = [
  //     {width: 1280, height:1024},
  //     {width: 1920, height: 1080},
  //     {width: 200, height: 200}]
  takePageImage: async (filename, elementSnapshot, elementsToHide
  ) => {
    // const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    // const resultDirPositive = `${resultDir}positive/`;

    if (elementsToHide) {
      await module.exports.hideElements(elementsToHide);
    }

    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    // resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
    /** Logic to take an image of a whole page or an element image on a page */
    // let idx = 1;
    for (const resolution of resolutions) {
      // console.log(resultDirPositive,resolution,idx,filename );
      // console.log('list of images to use =====>>>>> : ', '-', resolution,  filename);
      await browser.setWindowSize(resolution.width, resolution.height);
      // console.log(`list of images to use =====>>>>> : ${idx}-${filename}`);
      // resultPathPositive = `${resultDirPositive}${idx}-${filename}`;

      // Convert each object in the array to the desired format
      const inputObject = resolution;
      // const resultString = objectToString(inputObject);
      resultString = objectToString(inputObject);
      // console.log(resultDirPositive,resultString,idx,filename );

      resultPathPositive = `${resultDirPositive}${resultString}-${filename}`;
      // resultPathPositive = (resultDirPositive,resolution,idx,filename);
      if (elementSnapshot) {
        let elem = await browser.$(elementSnapshot);
        await elem.saveScreenshot(`${resultPathPositive}`, async (err) => {
          await module.exports.timeoutErrormsg(err);
        });
      } else {
        await browser.saveScreenshot(`${resultPathPositive}`, async (err) => {
          await module.exports.timeoutErrormsg(err);
        });
      }
      await browser.setWindowSize(resolution.width, resolution.height);
      if (elementsToHide) {
        await module.exports.showElements(elementsToHide);
      }
      // idx++
      console.log(`\t images saved to: ${resultPathPositive}`);
      await module.exports.assertion(filename);
      await module.exports.value();
      await module.exports.pass();
    }
  },

  /**
   * Runs assertions and comparison checks on the taken images
   * @param filename
   * @param expected
   * @param result
   * @param value
   * @returns {Promise<void>}
   */
  assertion(filename, expected, result, value) {
    // const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
    // const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    // const resultDirPositive = `${resultDir}positive/`;
    // const resultDirNegative = `${resultDir}negative/`;

    // const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
    // const diffDirPositive = `${diffDir}positive/`;
    // const diffDirNegative = `${diffDir}negative/`;

    // let idx = 1;
    fileName = filename;
    const baselinePath = `${baselineDir}${resultString}-${filename}`;
    resultPathPositive = `${resultDirPositive}${resultString}-${filename}`;

    fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
    fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
    this.expected = 0.2 || expected; // misMatchPercentage tolerance default 0.3%
    if (!fs.existsSync(baselinePath)) {
      // create new baseline image if none exists
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
    resemble(baselinePath)
        .compareTo(resultPathPositive)
        .ignoreAntialiasing()
        .ignoreColors()
        .onComplete(async (res) => {
          result = await res;
        });
    // },

    this.value = async function () {
      // value: async function() {
      console.log('we are here ======================>>>>>>>>>>>>>>>>>>>>>>>>')
      // let idx = 1;
      let filename = await fileName;
      const resultPathNegative = `${resultDirNegative}${resultString}-${filename}`;
      const resultPathPositive = `${resultDirPositive}${resultString}-${filename}`;
      while (typeof result === 'undefined') {
        await browser.pause(DELAY_100ms);
      }
      const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
      fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it

      if (error > this.expected) {
        diffFile = `${diffDirNegative}${resultString}-${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        await result.getDiffImage().pack().pipe(writeStream);
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
        fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
        fs.removeSync(resultPathNegative);
        fs.moveSync(resultPathPositive, resultPathNegative, false);
        console.log(`\t Create diff image [negative]: ${diffFile}`);
      } else {
        diffFile = `${diffDirPositive}${resultString}-${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        result.getDiffImage().pack().pipe(writeStream);
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
      }
    }

    this.pass = async function () {
      value = parseFloat(result.misMatchPercentage);
      this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
          value - this.expected
      } - expected: ${this.expected} but got: ${value}`}`;
      const baselinePath = `${baselineDir}${resultString}-${filename}`;
      const resultPathNegative = `${resultDirNegative}${resultString}-${filename}`;
      const pass = value <= this.expected;
      const err = value > this.expected;

      if (pass) {
        console.log(`image Match for $${resultString}-${filename} with ${value}% difference.`);
        await browser.pause(DELAY_1s);
      }

      if (err === true && program.opts().updateBaselineImage) {
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
  },

  timeoutErrormsg: async (err) => {
    await browser.pause(DELAY_500ms);
    if (err) {
      console.error(err.message);
    }
  },

  baselineUpdate: async()=>{
    console.log('we are here =====================>>>>>>>>>>>>>>>>>>>>>')
    // if(updateBaseline){
    // console.log(
    //     `${this.message}   images at:\n` +
    //     `   Baseline: ${baselinePath}\n` +
    //     `   Result: ${resultPathNegative}\n` +
    //     `    cp ${resultPathNegative} ${baselinePath}`
    // );
    // await fs.copy(resultPathNegative, baselinePath, (err) => {
    //   console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
    //   if (err) {
    //     console.error('The Baseline images were NOT updated: ', err.message);
    //     throw err;
    //   }
    // });
    // } else if (err) {
    //   console.log(
    //       `${this.message}   images at:\n` +
    //       `   Baseline: ${baselinePath}\n` +
    //       `   Result: ${resultPathNegative}\n` +
    //       `   Diff: ${diffFile}\n` +
    //       `   Open ${diffFile} to see how the image has changed.\n` +
    //       '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
    //       `    cp ${resultPathNegative} ${baselinePath}`
    //   );
    //   throw `${err} - ${this.message}`;
    // }

    // if (err === true && program.opts().updateBaselineImage) {
    // // if (err === true && settings.updateBaselineImage) {
    // // if (program.opts().updateBaselineImage) {
    // // if (settings.updateBaselineImage) {
    //   console.log('we are here =====================>>>>>>>>>>>>>>>>>>>>>')
    //   console.log(
    //     `${this.message}   images at:\n` +
    //       `   Baseline: ${baselinePath}\n` +
    //       `   Result: ${resultPathNegative}\n` +
    //       `    cp ${resultPathNegative} ${baselinePath}`
    //   );
    //   await fs.copy(resultPathNegative, baselinePath, (err) => {
    //     console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
    //     if (err) {
    //       console.error('The Baseline images were NOT updated: ', err.message);
    //       throw err;
    //     }
    //   });
    // } else if (err) {
    //   console.log(
    //     `${this.message}   images at:\n` +
    //       `   Baseline: ${baselinePath}\n` +
    //       `   Result: ${resultPathNegative}\n` +
    //       `   Diff: ${diffFile}\n` +
    //       `   Open ${diffFile} to see how the image has changed.\n` +
    //       '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
    //       `    cp ${resultPathNegative} ${baselinePath}`
    //   );
    //   throw `${err} - ${this.message}`;
    // }
  },

  /**
   * hideElemements hide elements
   * @param selectors
   */
  hideElements: async (selectors) => {
    // if arg is no array make it one
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
      await browser.execute(script);
    }
  },

  /**
   * showElemements show elements
   * @param selectors
   */
  showElements: async (selectors) => {
    // if arg is no array make it one
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
      await browser.execute(script);
    }
  },
};
