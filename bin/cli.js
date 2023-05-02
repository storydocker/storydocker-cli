#!/usr/bin/env node

import { Command } from 'commander';

import { addStorybookBoilerplate } from './storybook-cli.js';
import { addStoryDockerFiles } from './storydocker.js';

const program = new Command();

program.command('add-storybook')
  .description('Add Storybook boilerplate to a project')
  .argument('[string]', 'project directory')
  .option('-t, --type <string>', 'project type')
  .option('-b, --builder <string>', 'project builder')
  .action((str, options) => {
    const optionsArr = new Set();
    if (options.type) {
      optionsArr.add('--type');
      optionsArr.add(options.type);
    }
    if (options.builder) {
      optionsArr.add('--builder');
      optionsArr.add(options.builder);
    }
    addStorybookBoilerplate(str, Array.from(optionsArr));
  });

program.command('add-storydocker')
  .description('Add Dockerfile.storydocker and docker-compose.yml to a project')
  .argument('[string]', 'project directory')
  .action((str) => {
    addStoryDockerFiles(str);
  });

program.parse();