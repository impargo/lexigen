import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { generate as generateTypescript } from './generators/typescripts'
import { fetchEventsSchema } from './mixpanel'

enum GenerationOptions {
  typescript = 'typescript',
}

const generators: Record<GenerationOptions, typeof generateTypescript> = {
  typescript: generateTypescript,
}

const { username, secret, project, target } = yargs(hideBin(process.argv))
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
    choices: [GenerationOptions.typescript],
    description: 'A target API to generate.',
    default: 'typescript',
  })
  .parseSync()

fetchEventsSchema(username, secret, project)
  .then(generators[target as GenerationOptions])
  .then(console.log)
