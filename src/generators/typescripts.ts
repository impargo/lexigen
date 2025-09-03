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

export const generate = async (events: EventSchema[], serverSide: boolean): Promise<string> => {
  const formattedEvents = await Promise.all(events.map(async event => {
    const interfaceName = `${pascalCase(event.name)}Properties`
    const functionName = `track${pascalCase(event.name)}Event`
    const params = await generateParamsForEvent(event, interfaceName)
    const shouldParamsBeOptional = !Object.keys(event.schemaJson.properties ?? {}).length
    // eslint-disable-next-line max-len
    if (serverSide) {
      return `${params}\n${formatDescription(event)}export const ${functionName} = (distinct_id: string, properties${shouldParamsBeOptional ? '?' : ''}: ${interfaceName}) => mixpanel?.track('${event.name}', { distinct_id, ...properties })`
    }
    // eslint-disable-next-line max-len
    return `${params}\n${formatDescription(event)}export const ${functionName} = (properties${shouldParamsBeOptional ? '?' : ''}: ${interfaceName}) => mixpanel.track('${event.name}', properties)`
  }))
  if (serverSide) {
    return `/* eslint-disable */
import Mixpanel from 'mixpanel'

let mixpanel: Mixpanel.Mixpanel | undefined
export const initMixpanel = (token: string) => {
  mixpanel = Mixpanel.init(token)
}
${formattedEvents.join('\n\n')}`
  }
  return `
/* eslint-disable */
import mixpanel from 'mixpanel-browser'
${formattedEvents.join('\n\n')}`
}
