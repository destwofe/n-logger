# N-Logger
customize logger with 3 level and write to file saparated error file and saparated day

## Levels
- debug
- info
- error

## USE
``` javascript
  const logger = require('@destwofe/n-logger')('index.js')

  logger.debug('debug')
  logger.info('info', { x: 10 })
  logger.error('error', new Error('timmer break'))
```