const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');

const getfullFilePath = filepath => path.resolve(filepath);

const getDimensions = size => {
  const sizeAsArray = size.toString().split('x');

  if (sizeAsArray.length === 2) {
    const [width, height] = sizeAsArray;
    return { width: parseInt(width), height: parseInt(height) };
  } else {
    const sizeNumber = parseInt(size);
    return { width: sizeNumber, height: sizeNumber };
  }
};

const convert = async (inputFilePath, outputFilePath, outputSize = null) => {
  try {
    await sharp(getfullFilePath(inputFilePath))
      .png()
      .resize(outputSize)
      .toFile(getfullFilePath(outputFilePath));

    console.log(
      chalk.green.bold(
        `Successfully coverted ${path.basename(
          inputFilePath
        )} to ${outputFilePath}.`
      )
    );
  } catch (err) {
    console.log(
      chalk.red.bold(
        `Failed to covert ${path.basename(inputFilePath)} to PNG.`
      ),
      err
    );
  }
};

module.exports = {
  getfullFilePath,
  getDimensions,
  convert
};
