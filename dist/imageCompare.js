"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
/**
 * klassijs
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
var resemble = require('klassijs-resembleJs');
var fs = require('fs-extra');
var program = require('commander');
var envName = env.envName.toLowerCase();
var fileName;
var diffFile;
var browserName;
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
  takePageImage: function () {
    var _takePageImage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(filename, elementSnapshot, elementsToHide) {
      var resultDir, resultDirPositive, resultPathPositive, elem;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            // const getRemote = require('../klassijs/getRemote');
            // const remoteService = getRemote(settings.remoteService);
            //
            // if (remoteService && remoteService.type === 'lambdatest') {
            //   browserName = settings.remoteConfig || BROWSER_NAME;
            //   await browserName;
            // } else {
            //   browserName = settings.remoteConfig || program.opts().browser;
            // }
            resultDir = "./artifacts/visual-regression/original/".concat(browserName, "/").concat(envName, "/");
            resultDirPositive = "".concat(resultDir, "positive/");
            if (!elementsToHide) {
              _context3.next = 5;
              break;
            }
            _context3.next = 5;
            return helpers.hideElements(elementsToHide);
          case 5:
            fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
            resultPathPositive = "".concat(resultDirPositive).concat(filename);
            /** Logic to take an image of a whole page or an element image on a page */
            if (!elementSnapshot) {
              _context3.next = 15;
              break;
            }
            _context3.next = 10;
            return browser.$(elementSnapshot);
          case 10:
            elem = _context3.sent;
            _context3.next = 13;
            return elem.saveScreenshot(resultPathPositive, /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(err) {
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return module.exports.timeoutErrormsg(err);
                    case 2:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function (_x4) {
                return _ref.apply(this, arguments);
              };
            }());
          case 13:
            _context3.next = 17;
            break;
          case 15:
            _context3.next = 17;
            return browser.saveScreenshot(resultPathPositive, /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(err) {
                return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return module.exports.timeoutErrormsg(err);
                    case 2:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              }));
              return function (_x5) {
                return _ref2.apply(this, arguments);
              };
            }());
          case 17:
            if (!elementsToHide) {
              _context3.next = 20;
              break;
            }
            _context3.next = 20;
            return helpers.showElements(elementsToHide);
          case 20:
            console.log("\t images saved to: ".concat(resultPathPositive));
          case 21:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    function takePageImage(_x, _x2, _x3) {
      return _takePageImage.apply(this, arguments);
    }
    return takePageImage;
  }(),
  timeoutErrormsg: function () {
    var _timeoutErrormsg = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(err) {
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return browser.pause(DELAY_500ms);
          case 2:
            if (err) {
              console.error(err.message);
            }
          case 3:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    function timeoutErrormsg(_x6) {
      return _timeoutErrormsg.apply(this, arguments);
    }
    return timeoutErrormsg;
  }(),
  /**
   * Runs assertions and comparison checks on the taken images
   * @param filename
   * @param expected
   * @param result
   * @param value
   * @returns {Promise<void>}
   */
  assertion: function assertion(filename, expected, result, value) {
    var baselineDir = "./visual-regression-baseline/".concat(browserName, "/").concat(envName, "/");
    var resultDir = "./artifacts/visual-regression/original/".concat(browserName, "/").concat(envName, "/");
    var resultDirPositive = "".concat(resultDir, "positive/");
    var resultDirNegative = "".concat(resultDir, "negative/");
    var diffDir = "./artifacts/visual-regression/diffs/".concat(browserName, "/").concat(envName, "/");
    var diffDirPositive = "".concat(diffDir, "positive/");
    var diffDirNegative = "".concat(diffDir, "negative/");
    fileName = filename;
    var baselinePath = "".concat(baselineDir).concat(filename);
    var resultPathPositive = "".concat(resultDirPositive).concat(filename);
    fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
    fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
    this.expected = 0.2 || expected; // misMatchPercentage tolerance default 0.3%
    if (!fs.existsSync(baselinePath)) {
      // create new baseline image if none exists
      console.log('\t WARNING: Baseline image does NOT exist.');
      console.log("\t Creating Baseline image from Result: ".concat(baselinePath));
      fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
    }
    resemble.outputSettings({
      errorColor: {
        red: 225,
        green: 0,
        blue: 225
      },
      errorType: 'movement',
      transparency: 0.1,
      largeImageThreshold: 1200
    });
    resemble(baselinePath).compareTo(resultPathPositive).ignoreAntialiasing().ignoreColors().onComplete( /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(res) {
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return res;
            case 2:
              result = _context5.sent;
            case 3:
            case "end":
              return _context5.stop();
          }
        }, _callee5);
      }));
      return function (_x7) {
        return _ref3.apply(this, arguments);
      };
    }());
    /**
     * @returns {Promise<void>}
     */
    this.value = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      var resultPathNegative, resultPathPositive, error, writeStream, _writeStream;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return fileName;
          case 2:
            filename = _context6.sent;
            resultPathNegative = "".concat(resultDirNegative).concat(filename);
            resultPathPositive = "".concat(resultDirPositive).concat(filename);
          case 5:
            if (!(typeof result === 'undefined')) {
              _context6.next = 10;
              break;
            }
            _context6.next = 8;
            return browser.pause(DELAY_100ms);
          case 8:
            _context6.next = 5;
            break;
          case 10:
            error = parseFloat(result.misMatchPercentage); // value this.pass is called with
            fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it
            if (!(error > this.expected)) {
              _context6.next = 24;
              break;
            }
            diffFile = "".concat(diffDirNegative).concat(filename);
            writeStream = fs.createWriteStream(diffFile);
            _context6.next = 17;
            return result.getDiffImage().pack().pipe(writeStream);
          case 17:
            writeStream.on('error', function (err) {
              console.log('this is the writeStream error ', err);
            });
            fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
            fs.removeSync(resultPathNegative);
            fs.moveSync(resultPathPositive, resultPathNegative, false);
            console.log("\t Create diff image [negative]: ".concat(diffFile));
            _context6.next = 28;
            break;
          case 24:
            diffFile = "".concat(diffDirPositive).concat(filename);
            _writeStream = fs.createWriteStream(diffFile);
            result.getDiffImage().pack().pipe(_writeStream);
            _writeStream.on('error', function (err) {
              console.log('this is the writeStream error ', err);
            });
          case 28:
          case "end":
            return _context6.stop();
        }
      }, _callee6, this);
    }));
    /**
     * @returns {Promise<boolean>}
     */
    this.pass = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var baselinePath, resultPathNegative, pass, err;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            value = parseFloat(result.misMatchPercentage);
            this.message = "image Match Failed for ".concat(filename, " with a tolerance difference of ", "".concat(value - this.expected, " - expected: ").concat(this.expected, " but got: ").concat(value));
            baselinePath = "".concat(baselineDir).concat(filename);
            resultPathNegative = "".concat(resultDirNegative).concat(filename);
            pass = value <= this.expected;
            err = value > this.expected;
            if (!pass) {
              _context7.next = 10;
              break;
            }
            console.log("image Match for ".concat(filename, " with ").concat(value, "% difference."));
            _context7.next = 10;
            return browser.pause(DELAY_1s);
          case 10:
            if (!(err === true && program.opts().updateBaselineImage)) {
              _context7.next = 16;
              break;
            }
            console.log("".concat(this.message, "   images at:\n") + "   Baseline: ".concat(baselinePath, "\n") + "   Result: ".concat(resultPathNegative, "\n") + "    cp ".concat(resultPathNegative, " ").concat(baselinePath));
            _context7.next = 14;
            return fs.copy(resultPathNegative, baselinePath, function (err) {
              console.log(" All Baseline images have now been updated from: ".concat(resultPathNegative));
              if (err) {
                console.error('The Baseline images were NOT updated: ', err.message);
                throw err;
              }
            });
          case 14:
            _context7.next = 19;
            break;
          case 16:
            if (!err) {
              _context7.next = 19;
              break;
            }
            console.log("".concat(this.message, "   images at:\n") + "   Baseline: ".concat(baselinePath, "\n") + "   Result: ".concat(resultPathNegative, "\n") + "   Diff: ".concat(diffFile, "\n") + "   Open ".concat(diffFile, " to see how the image has changed.\n") + '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' + "    cp ".concat(resultPathNegative, " ").concat(baselinePath));
            throw "".concat(err, " - ").concat(this.message);
          case 19:
          case "end":
            return _context7.stop();
        }
      }, _callee7, this);
    }));
  }
};