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
  .option('-a, --addons <addons...>', 'Storybook addons')
  .action((str, options) => {
    const optionsArr = new Set();
    const sdOpts = {};
    if (options.type) {
      optionsArr.add('--type');
      optionsArr.add(options.type);
    }
    if (options.builder) {
      optionsArr.add('--builder');
      optionsArr.add(options.builder);
    }
    if (options.addons) {
      sdOpts.addons = options.addons;
    }
    addStorybookBoilerplate(str, Array.from(optionsArr), sdOpts);
  });

program.command('add-storydocker')
  .description('Add Dockerfile.storydocker and docker-compose.yml to a project')
  .argument('[string]', 'project directory')
  .action((str) => {
    addStoryDockerFiles(str);
  });

program.parseAsync();