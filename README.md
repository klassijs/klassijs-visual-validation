# Klassijs Visual Validation Tool

## Overview

**Visual Validation** is a powerful tool designed to compare two images and detect any differences between them. It is particularly useful in scenarios such as UI regression testing, where you want to ensure that visual changes between versions of a product or webpage haven't occurred unintentionally. The tool compares the provided image to a reference image (an earlier version) to confirm if there are any discrepancies.

## Features

- **Image Comparison**: Compares two images to detect visual differences.
- **Regressions Detection**: Ideal for detecting UI regressions where layout or visual changes might affect the user interface.
- **Easy Integration**: Simple to integrate into your test automation framework.
- **Single Function Call**: Take screenshots and compare them in one operation.
- **WebDriver Mode Detection**: Automatically detects and handles both W3C and Classic WebDriver modes for maximum compatibility.

## Installation

To add the **Visual Validation** tool to your project, you can use **pnpm**:

1. Open your terminal and navigate to your project directory.
2. Run the following command:
   ```bash
   pnpm add klassijs-visual-validation
   ```

## Usage

Here's a guide on how to use **Visual Validation** in your project:

1. **Import the Tool**:
   Import the `visual-validation` module into your code:
   ```javascript
   const {takeImage, compareImage} = require('klassijs-visual-validation');
   ```

2. **Take Screenshot and Compare** (Recommended):
   Use the `takeImage` method to take a screenshot and automatically compare it with the baseline:
   ```javascript
   await takeImage('screenshot.png');
   ```

   This single call will:
   - Take a screenshot of the entire page
   - Compare it with the baseline image
   - Generate diff images if differences are found
   - Log the comparison results

3. **Advanced Usage Options**:
   ```javascript
   // Take screenshot of a specific element and compare
   await takeImage('button.png', '.submit-button');
   
   // Hide elements during screenshot and compare
   await takeImage('clean-page.png', null, '.header, .footer');
   
   // Take screenshot without comparison
   await takeImage('screenshot.png', null, '', false);
   
   // Use custom tolerance for comparison
   await takeImage('screenshot.png', null, '', true, 0.1);
   ```

4. **Separate Comparison** (Legacy):
   If you need to perform comparison separately:
   ```javascript
   await takeImage(fileName, elementSnapshot, elementsToHide);
   await compareImage('path/to/actual-image.png');
   ```

## Example

Here's a simple example that demonstrates how to use the **Visual Validation** tool:

```javascript
const {takeImage} = require('klassijs-visual-validation');

async function validateVisualChanges() {
    // Take screenshot and compare with baseline in one call
    await takeImage('homepage.png');
    
    // Take screenshot of specific element and compare
    await takeImage('login-form.png', '.login-container');
    
    // Hide dynamic content and compare
    await takeImage('clean-dashboard.png', null, '.user-info, .timestamp');
}

validateVisualChanges();
```

## Function Parameters

The `takeImage` function accepts the following parameters:

```javascript
takeImage(fileName, elementSnapshot, elementsToHide, shouldCompare, expectedTolerance)
```

- `fileName` (string, required): Name of the screenshot file
- `elementSnapshot` (string, optional): CSS selector for specific element to screenshot
- `elementsToHide` (string, optional): CSS selectors of elements to hide during screenshot
- `shouldCompare` (boolean, optional): Whether to perform comparison (default: true)
- `expectedTolerance` (number, optional): Tolerance for comparison (default: 0.2)

## Advanced Options

This allows for taking images where there is dynamic content and then comparing it with the reference image:

```javascript
// Hide dynamic elements like timestamps, user info, etc.
await takeImage('dashboard.png', null, '.timestamp, .user-info, .notification');
```

## WebDriver Mode Detection

The tool now automatically detects whether your WebDriver is running in **W3C** or **Classic** mode and adjusts the screenshot behavior accordingly:

- **W3C Mode**: Uses callback-based screenshot methods for modern WebDriver implementations
- **Classic Mode**: Uses synchronous screenshot methods for legacy WebDriver implementations
- **Fallback Detection**: Automatically falls back to alternative methods if the primary approach fails

This ensures compatibility with:
- Selenium 4+ (W3C mode)
- Selenium 3.x (Classic mode)
- Appium
- BrowserStack
- Sauce Labs
- And other WebDriver-compatible services

The detection is automatic and requires no configuration changes in your existing code.

## Contributing

We welcome contributions! If you encounter any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
