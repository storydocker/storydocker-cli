import fs from 'fs-extra';
import path from 'path';
import { JsPackageManager } from '@storybook/cli';
import { spawn } from 'child_process';

/**
 * Storybook addons installed by StoryDocker
 */
const storyDockerAddons = [
  '@storybook/addon-essentials',
  '@storybook/addon-links',
  '@storybook/addon-interactions',
  '@storybook/addon-coverage',
];

/**
 * Add storybook npm scripts to package.json
 */
export const addScripts = async (cwd = './', pkgJson) => {
  if (pkgJson) {
    await fs.outputFile(
      path.join(cwd, './package.json'),
      JSON.stringify(pkgJson, null, 2)
    );
  }
  const packageManager = new JsPackageManager({ cwd });
  // adds `storybook` and `build-storybook` scripts
  await packageManager.addStorybookCommandInScripts({
    port: '${SB_PORT:-6006}',
  });
  await packageManager.addScripts({
    'test-storybook':
      'test-storybook --url http://localhost:${SB_PORT:-6006}  --coverage',
  });
};

/**
 * Add storybook addon
 */
export const generatorStorybookAddons = async (cwd = './', addons = []) => {
  if (!cwd) {
    console.error('Need project directory');
    return;
  }
  if (!addons) {
    console.log('Please specify a Storybook addon');
    return;
  }
  const sbConfigPath = path.join(cwd, '.storybook');
  const contents = await fs.readdir(sbConfigPath);
  let filename = 'main.js';
  contents.forEach((file) => {
    if (file.includes('main')) {
      filename = file;
    }
  });
  const mainFilePath = path.join(sbConfigPath, filename);
  const mainFile = await fs.readFile(mainFilePath, 'utf8');
  const combinedAddons = Array.from(new Set(storyDockerAddons.concat(addons)));
  const addonList = combinedAddons.map((addon) => `'${addon}'`).join(', ');
  const newFile = mainFile.replace(/(?<=addons: \[)(.|\n)*(?=\])/gm, addonList);
  await fs.outputFile(mainFilePath, newFile);
};

/**
 * Add storybook config files, boilerplate stories & components and npm scripts
 */
export const addStorybookBoilerplate = async (cwd = './', optionsArr = [], sdOpts = {}) => {
  const packageManager = new JsPackageManager({ cwd });
  const initialPackageJson = await packageManager.retrievePackageJson();
  const sb = spawn('npx', ['storybook', 'init', '--skip-install'].concat(optionsArr), {
    cwd,
  });
  let killed = false;
  sb.stdout.on('data', (data) => {
    if (data.includes('storybook init')) {
      console.log('Installing storybook files using `storybook-cli`');
    }
    if (data.includes('Adding Storybook support to')) {
      console.log(data.toString().trim());
    }
    if (data.includes('Do you want to run the')) {
      sb.stdin.write('n');
      sb.stdin.end();
    }
    if (data.includes(`We couldn't detect your project type.`)) {
      sb.stdin.write('n');
      sb.stdin.end();
      killed = true;
      sb.kill();
    }
  });

  sb.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  sb.on('close', async (code) => {
    if (killed) {
      console.log('Storybook setup cancelled');
      return;
    }
    await generatorStorybookAddons(cwd, sdOpts.addons);
    await addScripts(cwd, initialPackageJson);
    console.log(`storybook's cli exited with code ${code}`);
  });
};
