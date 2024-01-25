// /**
//  * klassijs
//  * Copyright © 2016 - Larry Goddard
//
//  * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//  */
// const resemble = require('klassijs-resembleJs');
// const fs = require('fs-extra');
// const program = require('commander');
//
// const envName = env.envName.toLowerCase();
// const browserName = settings.remoteConfig || BROWSER_NAME
//
// let fileName;
// let diffFile;
//
// program
//   .option('--updateBaselineImage', 'automatically update the baseline image after a failed comparison')
//   .parse(process.argv);
//
// const options = program.opts();
// const settings = {
//   updateBaselineImage: options.updateBaselineImage,
// };
//
// module.exports = {
//   /**
//    * Take an image of the current page and saves it as the given filename.
//    * @method saveScreenshot
//    * @param {string} filename The complete path to the file name where the image should be saved.
//    * @param elementsToHide
//    * @param filename
//    * @param elementSnapshot
//    * @returns {Promise<void>}
//    */
//   takePageImage: async (filename, elementSnapshot, elementsToHide) => {
//     const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
//     const resultDirPositive = `${resultDir}positive/`;
//
//     if (elementsToHide) {
//       await module.exports.hideElements(elementsToHide);
//     }
//
//     fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
//     const resultPathPositive = `${resultDirPositive}${filename}`;
//
//     /** Logic to take an image of a whole page or an element image on a page */
//     if (elementSnapshot) {
//       let elem = await browser.$(elementSnapshot);
//       await elem.saveScreenshot(resultPathPositive, async (err) => {
//         await module.exports.timeoutErrormsg(err);
//       });
//     } else {
//       await browser.saveScreenshot(resultPathPositive, async (err) => {
//         await module.exports.timeoutErrormsg(err);
//       });
//     }
//
//     if (elementsToHide) {
//       await module.exports.showElements(elementsToHide);
//     }
//     console.log(`\t images saved to: ${resultPathPositive}`);
//   },
//
//   timeoutErrormsg: async (err) => {
//     await browser.pause(DELAY_500ms);
//     if (err) {
//       console.error(err.message);
//     }
//   },
//
//   /**
//    * Runs assertions and comparison checks on the taken images
//    * @param filename
//    * @param expected
//    * @param result
//    * @param value
//    * @returns {Promise<void>}
//    */
//   assertion(filename, expected, result, value) {
//     const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
//     const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
//     const resultDirPositive = `${resultDir}positive/`;
//     const resultDirNegative = `${resultDir}negative/`;
//
//     const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
//     const diffDirPositive = `${diffDir}positive/`;
//     const diffDirNegative = `${diffDir}negative/`;
//
//     fileName = filename;
//     const baselinePath = `${baselineDir}${filename}`;
//     const resultPathPositive = `${resultDirPositive}${filename}`;
//     fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
//     fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
//     this.expected = 0.2 || expected; // misMatchPercentage tolerance default 0.3%
//     if (!fs.existsSync(baselinePath)) {
//       // create new baseline image if none exists
//       console.log('\t WARNING: Baseline image does NOT exist.');
//       console.log(`\t Creating Baseline image from Result: ${baselinePath}`);
//       fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
//     }
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
//     resemble(baselinePath)
//       .compareTo(resultPathPositive)
//       .ignoreAntialiasing()
//       .ignoreColors()
//       .onComplete(async (res) => {
//         result = await res;
//       });
//     /**
//      * @returns {Promise<void>}
//      */
//     this.value = async function () {
//       filename = await fileName;
//       const resultPathNegative = `${resultDirNegative}${filename}`;
//       const resultPathPositive = `${resultDirPositive}${filename}`;
//       while (typeof result === 'undefined') {
//         await browser.pause(DELAY_100ms);
//       }
//       const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
//       fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it
//
//       if (error > this.expected) {
//         diffFile = `${diffDirNegative}${filename}`;
//
//         const writeStream = fs.createWriteStream(diffFile);
//         await result.getDiffImage().pack().pipe(writeStream);
//         writeStream.on('error', (err) => {
//           console.log('this is the writeStream error ', err);
//         });
//         fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
//         fs.removeSync(resultPathNegative);
//         fs.moveSync(resultPathPositive, resultPathNegative, false);
//         console.log(`\t Create diff image [negative]: ${diffFile}`);
//       } else {
//         diffFile = `${diffDirPositive}${filename}`;
//
//         const writeStream = fs.createWriteStream(diffFile);
//         result.getDiffImage().pack().pipe(writeStream);
//         writeStream.on('error', (err) => {
//           console.log('this is the writeStream error ', err);
//         });
//       }
//     };
//     /**
//      * @returns {Promise<boolean>}
//      */
//     this.pass = async function () {
//       value = parseFloat(result.misMatchPercentage);
//       this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
//         value - this.expected
//       } - expected: ${this.expected} but got: ${value}`}`;
//       const baselinePath = `${baselineDir}${filename}`;
//       const resultPathNegative = `${resultDirNegative}${filename}`;
//       const pass = value <= this.expected;
//       const err = value > this.expected;
//
//       if (pass) {
//         console.log(`image Match for ${filename} with ${value}% difference.`);
//         await browser.pause(DELAY_1s);
//       }
//
//       // if (err === true && updateBaselineImage) {
//       //   await module.exports.updateBaseImages();
//       // }
//
//       if (err === true && program.opts().updateBaselineImage) {
//       // if (err === true && settings.updateBaselineImage) {
//         console.log(
//           `${this.message}   images at:\n` +
//             `   Baseline: ${baselinePath}\n` +
//             `   Result: ${resultPathNegative}\n` +
//             `    cp ${resultPathNegative} ${baselinePath}`
//         );
//         await fs.copy(resultPathNegative, baselinePath, (err) => {
//           console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
//           if (err) {
//             console.error('The Baseline images were NOT updated: ', err.message);
//             throw err;
//           }
//         });
//       } else if (err) {
//         console.log(
//           `${this.message}   images at:\n` +
//             `   Baseline: ${baselinePath}\n` +
//             `   Result: ${resultPathNegative}\n` +
//             `   Diff: ${diffFile}\n` +
//             `   Open ${diffFile} to see how the image has changed.\n` +
//             '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
//             `    cp ${resultPathNegative} ${baselinePath}`
//         );
//         throw `${err} - ${this.message}`;
//       }
//     };
//   },
//
//   /**
//    * hideElemements hide elements
//    * @param selectors
//    */
//   hideElements: async (selectors) => {
//     // if arg is no array make it one
//     selectors = typeof selectors === 'string' ? [selectors] : selectors;
//     for (let i = 0; i < selectors.length; i++) {
//       const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
//       await browser.execute(script);
//     }
//   },
//
//   /**
//    * showElemements show elements
//    * @param selectors
//    */
//   showElements: async (selectors) => {
//     // if arg is no array make it one
//     selectors = typeof selectors === 'string' ? [selectors] : selectors;
//     for (let i = 0; i < selectors.length; i++) {
//       const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
//       await browser.execute(script);
//     }
//   },
// };

/**
 * klassijs
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const resemble = require('klassijs-resembleJs');
const fs = require('fs-extra');
const program = require('commander');

program
    .option('--updateBaselineImage', 'automatically update the baseline image after a failed comparison', false)
    .parse(process.argv);
console.log('this is inside the module 1 =====>>>>>>>>> ', program.opts());

// const options = program.opts();
// const settings = {
//   updateBaselineImage: options.updateBaselineImage,
// };
// console.log('this is inside the module =====>>>>>>>>> ', process.argv)

const envName = env.envName.toLowerCase();
const browserName = settings.remoteConfig || BROWSER_NAME

let fileName;
let diffFile;

module.exports = {
  /**
   * Take an image of the current page and saves it as the given filename.
   * @method saveScreenshot
   * @param {string} filename The complete path to the file name where the image should be saved.
   * @param elementsToHide
   * @param filename
   * @param elementSnapshot
   * @returns {Promise<void>}
   */
  takePageImage: async (filename, elementSnapshot, elementsToHide, resolutions = [
    {width: 1280, height:1024},
    {width: 1920, height: 1080},
    {width: 200, height: 200}]
  ) => {
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;

    if (elementsToHide) {
      await module.exports.hideElements(elementsToHide);
    }

    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    // resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
    /** Logic to take an image of a whole page or an element image on a page */
    let idx = 1;
    for (const resolution of resolutions) {
      await browser.setWindowSize(resolution.width, resolution.height);
      resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
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
      idx++
// }
      console.log(`\t images saved to: ${resultPathPositive}`);
      if (elementsToHide) {
        await module.exports.showElements(elementsToHide);
      }
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
    const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;

    const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
    const diffDirPositive = `${diffDir}positive/`;
    const diffDirNegative = `${diffDir}negative/`;

    let idx = 1;
    fileName = filename;
    const baselinePath = `${baselineDir}${idx}-${filename}`;
    resultPathPositive = `${resultDirPositive}${idx}-${filename}`;

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

    this.value = async function () {
      let idx = 1;
      let filename = await fileName;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
      while (typeof result === 'undefined') {
        await browser.pause(DELAY_100ms);
      }
      const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
      fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it

      if (error > this.expected) {
        diffFile = `${diffDirNegative}${idx}-${filename}`;

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
        diffFile = `${diffDirPositive}${idx}-${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        result.getDiffImage().pack().pipe(writeStream);
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
      }
    };

    this.pass =async function () {
      console.log('we are here ======================>>>>>>>>>>>>>>>>>>>>>>>>')
      value = parseFloat(result.misMatchPercentage);
      this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
          value - this.expected
      } - expected: ${this.expected} but got: ${value}`}`;
      const baselinePath = `${baselineDir}${idx}-${filename}`;
      const resultPathNegative = `${resultDirNegative}${idx}-${filename}`;
      const pass = value <= this.expected;
      const err = value > this.expected;

      if (pass) {
        console.log(`image Match for ${idx}-${filename} with ${value}% difference.`);
        await browser.pause(DELAY_1s);
      }

      // if (program.opts().updateBaselineImage){
      //   await module.exports.baselineUpdate();
      // }

      // if (err === true && program.opts().updateBaselineImage) {
      // if (err === true && settings.updateBaselineImage) {
      // if (program.opts().updateBaselineImage) {
      // // if (settings.updateBaselineImage) {
      //   console.log('we are here =====================>>>>>>>>>>>>>>>>>>>>>')
      // //   console.log(
      // //     `${this.message}   images at:\n` +
      // //       `   Baseline: ${baselinePath}\n` +
      // //       `   Result: ${resultPathNegative}\n` +
      // //       `    cp ${resultPathNegative} ${baselinePath}`
      // //   );
      // //   await fs.copy(resultPathNegative, baselinePath, (err) => {
      // //     console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
      // //     if (err) {
      // //       console.error('The Baseline images were NOT updated: ', err.message);
      // //       throw err;
      // //     }
      // //   });
      // // } else if (err) {
      // //   console.log(
      // //     `${this.message}   images at:\n` +
      // //       `   Baseline: ${baselinePath}\n` +
      // //       `   Result: ${resultPathNegative}\n` +
      // //       `   Diff: ${diffFile}\n` +
      // //       `   Open ${diffFile} to see how the image has changed.\n` +
      // //       '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
      // //       `    cp ${resultPathNegative} ${baselinePath}`
      // //   );
      // //   throw `${err} - ${this.message}`;
      // }
    };
  },

  // assertion (filename, expected, result, value) {
  //   // module.exports.compareImages();
  //   // let resp = resultPathPositive;
  //   // console.log('this is the value of it all ==================>>>>>>>>>>>>>>>>>>>>  ', resp);
  //   const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
  //   const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
  //   const resultDirPositive = `${resultDir}positive/`;
  //   const resultDirNegative = `${resultDir}negative/`;
  //
  //   const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
  //   const diffDirPositive = `${diffDir}positive/`;
  //   const diffDirNegative = `${diffDir}negative/`;
  //
  //   let idx = 1;
  //   fileName = filename;
  //   const baselinePath = `${baselineDir}${idx}-${filename}`;
  //   resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
  //
  //   for (const resultPath1 of resultPathPositive) {
  //     console.log('this is the value of it all again ==================>>>>>>>>>>>>>>>>>>>>  ', resultPath1);
  //   }
  //
  //   fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
  //   fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
  //   this.expected = 0.2 || expected; // misMatchPercentage tolerance default 0.3%
  //   if (!fs.existsSync(baselinePath)) {
  //     // create new baseline image if none exists
  //     console.log('\t WARNING: Baseline image does NOT exist.');
  //     console.log(`\t Creating Baseline image from Result: ${baselinePath}`);
  //     fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
  //   }
  //   resemble.outputSettings({
  //     errorColor: {
  //       red: 225,
  //       green: 0,
  //       blue: 225,
  //     },
  //     errorType: 'movement',
  //     transparency: 0.1,
  //     largeImageThreshold: 1200,
  //   });
  //   resemble(baselinePath)
  //     .compareTo(resultPathPositive)
  //     .ignoreAntialiasing()
  //     .ignoreColors()
  //     .onComplete(async (res) => {
  //       result = await res;
  //     });
  //   /**
  //    * @returns {Promise<void>}
  //    */
  //   this.value = async function () {
  //     filename = await fileName;
  //     // const resultPathNegative = `${resultDirNegative}${filename}`;
  //     // const resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
  //     resultPathNegative = `${resultDirNegative}${idx}-${filename}`;
  //     resultPathPositive = `${resultDirPositive}${idx}-${filename}`;
  //     while (typeof result === 'undefined') {
  //       await browser.pause(DELAY_100ms);
  //     }
  //     const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
  //     fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it
  //
  //     if (error > this.expected) {
  //       diffFile = `${diffDirNegative}${idx}-${filename}`;
  //
  //       const writeStream = fs.createWriteStream(diffFile);
  //       await result.getDiffImage().pack().pipe(writeStream);
  //       writeStream.on('error', (err) => {
  //         console.log('this is the writeStream error ', err);
  //       });
  //       fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
  //       fs.removeSync(resultPathNegative);
  //       fs.moveSync(resultPathPositive, resultPathNegative, false);
  //       console.log(`\t Create diff image [negative]: ${diffFile}`);
  //     } else {
  //       diffFile = `${diffDirPositive}${idx}-${filename}`;
  //
  //       const writeStream = fs.createWriteStream(diffFile);
  //       result.getDiffImage().pack().pipe(writeStream);
  //       writeStream.on('error', (err) => {
  //         console.log('this is the writeStream error ', err);
  //       });
  //     }
  //   };
  //   /**
  //    * @returns {Promise<boolean>}
  //    */
  //   this.pass = async function () {
  //     value = parseFloat(result.misMatchPercentage);
  //     this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
  //       value - this.expected
  //     } - expected: ${this.expected} but got: ${value}`}`;
  //     const baselinePath = `${baselineDir}${idx}-${filename}`;
  //     const resultPathNegative = `${resultDirNegative}${idx}-${filename}`;
  //     const pass = value <= this.expected;
  //     const err = value > this.expected;
  //
  //     if (pass) {
  //       console.log(`image Match for ${idx}-${filename} with ${value}% difference.`);
  //       await browser.pause(DELAY_1s);
  //     }
  //
  //     // if (program.opts().updateBaselineImage){
  //     //   await module.exports.baselineUpdate();
  //     // }
  //
  //     // if (err === true && program.opts().updateBaselineImage) {
  //     // if (err === true && settings.updateBaselineImage) {
  //     // if (program.opts().updateBaselineImage) {
  //     // // if (settings.updateBaselineImage) {
  //     //   console.log('we are here =====================>>>>>>>>>>>>>>>>>>>>>')
  //     // //   console.log(
  //     // //     `${this.message}   images at:\n` +
  //     // //       `   Baseline: ${baselinePath}\n` +
  //     // //       `   Result: ${resultPathNegative}\n` +
  //     // //       `    cp ${resultPathNegative} ${baselinePath}`
  //     // //   );
  //     // //   await fs.copy(resultPathNegative, baselinePath, (err) => {
  //     // //     console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
  //     // //     if (err) {
  //     // //       console.error('The Baseline images were NOT updated: ', err.message);
  //     // //       throw err;
  //     // //     }
  //     // //   });
  //     // // } else if (err) {
  //     // //   console.log(
  //     // //     `${this.message}   images at:\n` +
  //     // //       `   Baseline: ${baselinePath}\n` +
  //     // //       `   Result: ${resultPathNegative}\n` +
  //     // //       `   Diff: ${diffFile}\n` +
  //     // //       `   Open ${diffFile} to see how the image has changed.\n` +
  //     // //       '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
  //     // //       `    cp ${resultPathNegative} ${baselinePath}`
  //     // //   );
  //     // //   throw `${err} - ${this.message}`;
  //     // }
  //   };
  // // }
  // },

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

