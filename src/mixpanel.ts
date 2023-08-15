import { JSONSchema } from 'json-schema-to-typescript'
import fetch from 'node-fetch'

interface GenericEntity {
  entityType: string,
}

export interface EventSchema extends GenericEntity {
  entityType: 'event',
  name: string,
  schemaJson: JSONSchema,
}

export const fetchEventsSchema = async (username: string, secret: string, project: string): Promise<EventSchema[]> => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Basic ${username}:${secret}`,
    },
  }
  const response = await fetch(`https://eu.mixpanel.com/api/app/projects/${project}/schemas`, options)
  const data = await response.json()
  if (data.status === 'error') {
    console.log('Mixpanel error:', data.error)
    process.exit(1)
  }
  return data.results.filter((item: GenericEntity): item is EventSchema => item.entityType === 'event')
}
