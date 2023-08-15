import { JSONSchema } from 'json-schema-to-typescript'
import fetch from 'node-fetch'

export interface EventSchema {
  entityType: 'event',
  name: string,
  schemaJson: JSONSchema,
}

export const fetchEventsSchema = async (username: string, secret: string, project: string, filterByTag?: string): Promise<EventSchema[]> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Basic ${username}:${secret}`,
    },
  }
  const response = await fetch(`https://eu.mixpanel.com/api/app/projects/${project}/schemas/event`, options)
  const data = await response.json()
  if (data.status === 'error') {
    console.log('Mixpanel error:', data.error)
    process.exit(1)
  }
  if (filterByTag) {
    return data.results.filter((event: EventSchema) => event.schemaJson.metadata['com.mixpanel'].tags.includes(filterByTag))
  }

  return data.results
}
