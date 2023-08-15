import { pascalCase } from 'change-case'
import { compile } from 'json-schema-to-typescript'

import { EventSchema } from '../mixpanel'

const generateParamsForEvent = async (event: EventSchema, name: string): Promise<string> => {
  return compile({ ...event.schemaJson, description: undefined }, name, {
    bannerComment: '',
    additionalProperties: false,
    style: {
      semi: false,
      singleQuote: true,
      trailingComma: 'all',
      parser: 'typescript',
    },
  })
}

const formatDescription = (event: EventSchema): string => {
  return event.schemaJson.description ? `/**\n * ${event.schemaJson.description}\n */\n` : ''
}

export const generate = async (events: EventSchema[]): Promise<string> => {
  const formattedEvents = await Promise.all(events.map(async event => {
    const interfaceName = `${pascalCase(event.name)}Properties`
    const functionName = `track${pascalCase(event.name)}Event`
    const params = await generateParamsForEvent(event, interfaceName)
    // eslint-disable-next-line max-len
    return `${params}\n${formatDescription(event)}export const ${functionName} = (properties: ${interfaceName}) => mixpanel.track('${event.name}', properties)`
  }))
  return `/* eslint-disable */\nimport mixpanel from 'mixpanel-browser'\n\n${formattedEvents.join('\n\n')}`
}
