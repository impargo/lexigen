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
      return `${params}\n${formatDescription(event)}export const ${functionName} = async (userId: string, properties${shouldParamsBeOptional ? '?' : ''}: ${interfaceName}, isDriver = false) => mixpanel?.track('${event.name}', { distinct_id: isDriver ? await driverHash(userId) : await dispatcherHash(userId), ...properties })`
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
const dispatcherHash = async (str: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.prototype.map.call(new Uint8Array(buf), x => (('00' + x.toString(16)).slice(-2))).join('').slice(0, 16)
}
const driverHash = async (str: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map(x => x.toString(16).padStart(2, "0"))
    .join("")
}
${formattedEvents.join('\n\n')}`
  }
  return `
/* eslint-disable */
import mixpanel from 'mixpanel-browser'

${formattedEvents.join('\n\n')}`
}
