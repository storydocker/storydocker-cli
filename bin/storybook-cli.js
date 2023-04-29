import fs from 'fs';
import path from 'path';
import { JsPackageManager } from '@storybook/cli';
import { spawn } from 'child_process';

/**
 * Add storybook npm scripts to package.json
 */
export const addScripts = (cwd = './', pkgJson) => {
  if (pkgJson) {
    fs.writeFileSync(
      path.join(cwd, './package.json'),
      JSON.stringify(pkgJson, null, 2)
    );
  }
  const packageManager = new JsPackageManager({ cwd });
  // adds `storybook` and `build-storybook` scripts
  packageManager.addStorybookCommandInScripts({
    port: '${SB_PORT:-6006}',
  });
  packageManager.addScripts({
    'test-storybook':
      'test-storybook --url http://localhost:${SB_PORT:-6006}  --coverage',
  });
};

/**
 * Add storybook config files, boilerplate stories & components and npm scripts
 */
export const addStorybookBoilerplate = (cwd = './') => {
  const packageManager = new JsPackageManager({ cwd });
  const initialPackageJson = packageManager.retrievePackageJson();
  const sb = spawn('npx', ['storybook', 'init', '--skip-install'], {
    cwd,
  });
  let killed = false;

  sb.stdout.on('data', (data) => {
    console.log(data.toString().trim());
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

  sb.on('close', (code) => {
    if (killed) {
      console.log('Storybook setup cancelled');
      return;
    }
    addScripts(cwd, initialPackageJson);
    console.log(`storybook's cli exited with code ${code}`);
  });
};
