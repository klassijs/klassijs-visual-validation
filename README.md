# Klassijs Visual Validation Tool

## Overview

**Visual Validation** is a powerful tool designed to compare two images and detect any differences between them. It is particularly useful in scenarios such as UI regression testing, where you want to ensure that visual changes between versions of a product or webpage haven't occurred unintentionally. The tool compares the provided image to a reference image (an earlier version) to confirm if there are any discrepancies.

## Features

- **Image Comparison**: Compares two images to detect visual differences.
- **Regressions Detection**: Ideal for detecting UI regressions where layout or visual changes might affect the user interface.
- **Easy Integration**: Simple to integrate into your test automation framework.

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

2. **Perform Image Comparison**:
   Use the `compareImages` method to compare two images:
   ```javascript
   await takeImage(fileName, elementSnapshot, elementsToHide);
   await compareImage('path/to/actual-image.png', 'path/to/reference-image.png');
   ```

   The `compareImages` method will return a result indicating if any differences were found between the two images.


## Example

Here’s a simple example that demonstrates how to use the **Visual Validation** tool:

```javascript
const {takeImage, compareImage} = require('klassijs-visual-validation');

async function validateVisualChanges() {
    await takeImage(`${image}_1-0.png`);
    await compareImage(`${image}_1-0.png`);
}

validateVisualChanges();
```
## Advanced Options
This allows for the taking images where it have dynamic content and then compare it with the reference image.
```javascript
await takeImage(`${image}_inputBox.png`, searchData.elem.searchInput, null);
```

## Contributing

We welcome contributions! If you encounter any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
