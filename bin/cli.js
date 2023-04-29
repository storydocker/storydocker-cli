#!/usr/bin/env node

import { Command } from 'commander';

import { addStorybookBoilerplate } from './storybook-cli.js';

const program = new Command();

program.command('add-storybook')
  .description('Add Storybook boilerplate to a project')
  .argument('[string]', 'project directory')
  .action((str, options) => {
    addStorybookBoilerplate(str);
  });

program.parse();