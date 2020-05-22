import { ReactElement } from 'react'
import { createAction } from 'typesafe-actions'

export const scroll = createAction('@searchResults/SCROLL')<number>()
export const cacheResults = createAction('@searchResults/CACHE_RESULTS')<ReactElement[]>()
export const cacheNames = createAction('@searchResults/CACHE_NAMES')<string[]>()
