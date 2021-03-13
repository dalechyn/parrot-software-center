import { createAction } from '@reduxjs/toolkit'
import { PackagePreview } from '../types/apt'

export const setPreview = createAction<{ preview: PackagePreview | null; index: number }>(
  '@previews/SET_PREVIEWS'
)

export const clear = createAction('@previews/CLEAR')
