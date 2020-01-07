#!/usr/bin/env node

const chalk = require('chalk');
const boxen = require('boxen');
const yargs = require('yargs');
const sizeOf = require('image-size');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const { convert, getDimensions, getfullFilePath } = require('../src/converter');

const options = yargs
  .usage(
    'Usage: -n <file path> | -f <folder path> -s <dimensions> -o <output file or folder>'
  )
  .option('n', {
    alias: 'name',
    describe: 'Path to the SVG file.',
    type: 'string'
  })
  .option('f', {
    alias: 'folder',
    describe: 'A folder containing SVG files.',
    type: 'string'
  })
  .option('o', {
    alias: 'output',
    describe:
      'Path to save the PNG file (s). If not provided the  file (s) will be saved to the same folder as the SVG file (s)',
    type: 'string'
  })
  .option('s', {
    alias: 'size',
    describe:
      'The dimension (s) of the image. If a single value is passed it will be for both the width and the height. Otherwise you can separate them with an x like this: widthxheight.'
  }).argv;

const getRes = index => {
  if (index > 0) {
    return `@${index + 1}x`;
  }

  return '';
};

const converSingleFile = (
  inputFilePath,
  outputFilePath = null,
  size = null
) => {
  [1, 2, 3].forEach(async (_, index) => {
    let dimensions = null;
    let sOutputFilePath;

    if (!outputFilePath) {
      sOutputFilePath = inputFilePath.replace('.svg', `${getRes(index)}.png`);
    } else {
      const dir = path.dirname(outputFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      sOutputFilePath = path.join(
        dir,
        path
          .basename(inputFilePath)
          .replace('svg', 'png')
          .replace('.png', `${getRes(index)}.png`)
      );
    }

    if (size) {
      sDimensions = getDimensions(size);
    } else {
      sDimensions = sizeOf(getfullFilePath(inputFilePath));
    }

    const { width, height } = sDimensions;

    dimensions = {
      width: width * (index + 1),
      height: height * (index + 1)
    };

    await convert(inputFilePath, sOutputFilePath, dimensions);
  });
};

const convertFolder = (
  inputFolderPath,
  outputFolderPath = null,
  size = null
) => {
  glob(inputFolderPath + '/*.svg', {}, (err, files) => {
    if (err) {
      console.log(chalk.red.bold('Error while scanning this directory.'));
    }

    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath, { recursive: true });
    }

    files.forEach(filePath => {
      converSingleFile(
        filePath,
        path.join(
          outputFolderPath,
          path.basename(filePath).replace('svg', 'png')
        ),
        size
      );
    });
  });
};

const start = () => {
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderColor: '#5e0d8b'
  };

  console.log(boxen(`Flexdrive's SVG to PNG tool`, boxenOptions));

  if (!options.n && !options.f) {
    console.log(
      chalk.yellow.bold(
        'No options chosen. Run bin/svg2png --help to show the available options.'
      )
    );
  } else {
    if (options.n) converSingleFile(options.n, options.o, options.s);
    if (options.f) convertFolder(options.f, options.o, options.s);
  }
};

start();
