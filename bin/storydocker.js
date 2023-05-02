import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../assets');

/**
 * Add storydocker docker files
 */
export const addStoryDockerFiles = async (outputDir) => {
  if (!outputDir) {
    console.error('Need project directory');
    return;
  }
  const dockerfile = 'Dockerfile.storydocker';
  const composefile = 'docker-compose.yml';
  try {
    await fs.copy(path.join(assetsDir, dockerfile), path.join(outputDir, dockerfile))
    console.log(`Copied ${dockerfile} to ${outputDir}`);
  } catch (err) {
    console.error(err)
  }
  try {
    await fs.copy(path.join(assetsDir, composefile), path.join(outputDir, composefile))
    console.log(`Copied ${composefile} to ${outputDir}`);
  } catch (err) {
    console.error(err)
  }
};
