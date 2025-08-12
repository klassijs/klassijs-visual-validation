# Klassijs Visual Validation Tool

## Overview

**Visual Validation** is a powerful tool designed to compare two images and detect any differences between them. It is particularly useful in scenarios such as UI regression testing, where you want to ensure that visual changes between versions of a product or webpage haven't occurred unintentionally. The tool compares the provided image to a reference image (an earlier version) to confirm if there are any discrepancies.

## Features

- **Image Comparison**: Compares two images to detect visual differences.
- **Regressions Detection**: Ideal for detecting UI regressions where layout or visual changes might affect the user interface.
- **Easy Integration**: Simple to integrate into your test automation framework.
- **Single Function Call**: Take screenshots and compare them in one operation.
- **W3C Mode Optimized**: Optimized for modern W3C WebDriver implementations with direct Promise-based screenshot methods.
- **Test Isolation**: Automatic error isolation between test runs to prevent cross-test contamination.
- **Clean Reporting**: Professional Cucumber report integration with focused error messages.

## Installation

To add the **Visual Validation** tool to your project, you can use **pnpm**:

1. Open your terminal and navigate to your project directory.
2. Run the following command:
   ```bash
   pnpm add klassijs-visual-validation
   ```

## Usage

Here's a guide on how to use **Visual Validation** in your project:

### 1. **Import the Tool**:
Import the `visual-validation` module into your code:
```javascript
const { takeImage, compareImage, ImageAssertion, clearErrors } = require('klassijs-visual-validation');
```

### 2. **Take Screenshot and Compare** (Recommended):
Use the `takeImage` method to take a screenshot and automatically compare it with the baseline:
```javascript
await takeImage('screenshot.png');
```

This single call will:
- Take a screenshot of the entire page
- Compare it with the baseline image
- Generate diff images if differences are found
- Log the comparison results

### 3. **Advanced Usage Options**:
```javascript
// Take screenshot of a specific element and compare
await takeImage('button.png', '.submit-button');

// Hide elements during screenshot and compare
await takeImage('clean-page.png', null, '.header, .footer');

// Take screenshot without comparison
await takeImage('screenshot.png', null, '', false);

// Use custom tolerance for comparison
await takeImage('screenshot.png', null, '', true, 0.1);

// Add wait time before capture
await takeImage('screenshot.png', null, '', true, 0.2, 500);
```

### 4. **Separate Comparison** (Legacy):
If you need to perform comparison separately:
```javascript
await takeImage(fileName, elementSnapshot, elementsToHide);
await compareImage('path/to/actual-image.png');
```

## Example

Here's a complete example that demonstrates how to use the **Visual Validation** tool:

```javascript
const { takeImage } = require('klassijs-visual-validation');

async function validateVisualChanges() {
    // Take screenshot and compare with baseline in one call
    await takeImage('homepage.png');
    
    // Take screenshot of specific element and compare
    await takeImage('login-form.png', '.login-container');
    
    // Hide dynamic content and compare
    await takeImage('clean-dashboard.png', null, '.user-info, .timestamp');
    
    // Multiple images in sequence (all errors will be collected)
    await takeImage('mango_1-0.png');
    await takeImage('mango_2-0.png');
    await takeImage('mango_3-0.png');
    await takeImage('mango_4-0.png');
}

validateVisualChanges();
```

## Function Parameters

### `takeImage` Function:
```javascript
takeImage(fileName, elementSnapshot, elementsToHide, shouldCompare, expectedTolerance, waitBeforeCapture)
```

- `fileName` (string, required): Name of the screenshot file
- `elementSnapshot` (string, optional): CSS selector for specific element to screenshot
- `elementsToHide` (string, optional): CSS selectors of elements to hide during screenshot
- `shouldCompare` (boolean, optional): Whether to perform comparison (default: true)
- `expectedTolerance` (number, optional): Tolerance for comparison (default: 0.2)
- `waitBeforeCapture` (number, optional): Wait time in milliseconds before taking screenshot (default: 100)

## Advanced Options

### Dynamic Content Handling:
```javascript
// Hide dynamic elements like timestamps, user info, etc.
await takeImage('dashboard.png', null, '.timestamp, .user-info, .notification');
```

### Custom Tolerance:
```javascript
// Use different tolerance for different types of content
await takeImage('text-content.png', null, '', true, 0.1);  // Strict tolerance
await takeImage('image-content.png', null, '', true, 0.5); // Relaxed tolerance
```

### Element-Specific Screenshots:
```javascript
// Screenshot specific elements for focused testing
await takeImage('header.png', '.site-header');
await takeImage('footer.png', '.site-footer');
await takeImage('navigation.png', '.main-nav');
```

## WebDriver Mode

The tool is optimized for **W3C mode** WebDriver implementations, which is the modern standard for browser automation.

**W3C Mode Features:**
- Uses direct Promise-based screenshot methods for optimal performance
- Compatible with modern WebDriver implementations
- Optimized for WebdriverIO v9+, Selenium 4+, Appium, BrowserStack, Sauce Labs, and other modern services
- No callback complexity or mode detection overhead

**Note:** This tool is designed for W3C mode WebDriver implementations. If you're using legacy Classic mode WebDriver, you may need to upgrade to a W3C-compatible version.

## Error Handling and Reporting

### Automatic Error Collection:
- All image comparison failures are automatically collected
- Errors are isolated between test runs
- Comprehensive error reporting at the end of each test

### Cucumber Integration:
- Clean, professional error messages in Cucumber reports
- No debug console clutter in reports
- Focused error information for stakeholders

### Test Isolation:
- Each test run starts with a clean errors array
- No cross-test error contamination
- Professional test framework behavior

## Contributing

We welcome contributions! If you encounter any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

Licenced under [MIT License](LICENSE) &copy; 2016 [Larry Goddard](https://www.linkedin.com/in/larryg)
