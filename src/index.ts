#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { generate as generateDart } from './generators/dart'
import { generate as generateTypescript } from './generators/typescripts'
import { fetchEventsSchema } from './mixpanel'

type GeneratorFunctionType = typeof generateTypescript
enum GenerationOptions {
  typescript = 'typescript',
  dart = 'dart',
}

const generators: Record<GenerationOptions, GeneratorFunctionType> = {
  typescript: generateTypescript,
  dart: generateDart,
}

const { username, secret, project, target, filter, serverSide } = yargs(hideBin(process.argv))
  .option('username', {
    alias: 'u',
    type: 'string',
    description: 'Mixpanel service account username.',
    demandOption: true,
  })
  .option('secret', {
    alias: 's',
    type: 'string',
    description: 'Mixpanel service account secret/password.',
    demandOption: true,
  })
  .option('project', {
    alias: 'p',
    type: 'string',
    description: 'Mixpanel project id to pull the schema definitions from.',
    demandOption: true,
  })
  .option('target', {
    alias: 't',
    type: 'string',
    choices: [GenerationOptions.typescript, GenerationOptions.dart],
    description: 'A target API to generate.',
    default: 'typescript',
  })
  .option('server-side', {
    alias: 'ss',
    type: 'boolean',
    description: 'Generate server-side code.',
    default: false,
  })
  .option('filter', {
    alias: 'f',
    type: 'string',
    description: 'Filters the events by a specific tag.',
  })
  .parseSync()

fetchEventsSchema(username, secret, project, filter)
  .then((schema) => generators[target as GenerationOptions](schema, serverSide))
  .then(console.log)
