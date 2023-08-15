# Lexigen
Generate tracking code based on Mixpanel's lexicon definitions.

## Usage
### Prerequisites
1. Generate a service account in Mixpanel with access to the desired mixpanel projects.
2. Find the Mixpanel project from which you want to use the schema.

### Minimum requirements
This package needs at least Node.js 16.

### Using the generator
```
npx lexigen -u <service-account-username> -s <service-account-secret> -p <project-id> -t <target-language> > tracking.ts
```
> The generated code is printed in `stdout`. You can simply redirect it to a file to save it.

## Language support
Currently supports the following generators:
- Typescript.

> The generator assumes that the mixpanel tracking package is already installed and setup. It only imports the package at the top of the generated file.
