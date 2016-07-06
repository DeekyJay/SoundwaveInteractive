import React from 'react'
import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
/* istanbul ignore next */
export default createDevTools(
  <LogMonitor />
)
