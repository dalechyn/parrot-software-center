import { ReactElement } from 'react'
import { createAction } from '@reduxjs/toolkit'

export const scroll = createAction<number>('@searchResults/SCROLL')
export const cacheResults = createAction<ReactElement[]>('@searchResults/CACHE_RESULTS')
export const cacheNames = createAction<string[]>('@searchResults/CACHE_NAMES')
