import { pascalCase } from 'change-case'
import { JSONSchema } from 'json-schema-to-typescript'

import { EventSchema } from '../mixpanel'

const dartTypeMapping: { [key: string]: string } = {
  string: 'String',
  number: 'double',
  integer: 'int',
  boolean: 'bool',
  array: 'List',
  object: 'Map<String, dynamic>',
}

const generateDartMethod = (eventName: string, schema: JSONSchema): string => {
  const requiredFields = schema.required || []
  const properties = schema.properties || {}

  const methodParams = Object.entries(properties)
    .map(([key, value]: [string, any]) => {
      const type = dartTypeMapping[value.type] || 'dynamic'
      const isRequired = requiredFields === true || requiredFields.includes(key)
      const paramName = pascalCase(key)
      return `${isRequired ? 'required ' : ''}${type}${isRequired ? '' : '?'} ${paramName}`
    })
    .join(', ')

  const propertiesMap = Object.entries(properties)
    .map(([key, _]) => `'${key}': ${pascalCase(key)}`)
    .join(',\n        ')

  if (!methodParams) {
    return `  static void track${pascalCase(eventName)}Event() =>
      _track('${eventName}');`
  }

  return `  static void track${pascalCase(eventName)}Event({
    ${methodParams}
  }) =>
      _track('${eventName}', properties: <String, dynamic>{
        ${propertiesMap},
      });`
}

const formatDescription = (event: EventSchema): string => {
  return event.schemaJson.description ? `/// ${event.schemaJson.description}\n` : ''
}

export const generate = async (events: EventSchema[]): Promise<string> => {
  const eventMethods = events.map((event) => {
    return `${formatDescription(event)}${generateDartMethod(event.name, event.schemaJson)}`
  })

  return `
import 'package:mixpanel_flutter/mixpanel_flutter.dart';

/// Abstract class to track analytics events
abstract class AnalyticsEvents {
  static void _track(String eventName, {Map<String, dynamic>? properties}) {
    Mixpanel.instance.track(eventName, properties);
  }

${eventMethods.join('\n\n')}
}
`
}
