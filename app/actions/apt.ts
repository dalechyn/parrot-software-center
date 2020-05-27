import { createAsyncThunk } from '@reduxjs/toolkit'

export const install = createAsyncThunk('@apt/INSTALL', async (packageName: string) => {
  console.log('apt install called on ', packageName)
})
export const uninstall = createAsyncThunk('@apt/UNINSTALL', async (packageName: string) => {
  console.log('apt uninstall called on ', packageName)
})
export const status = createAsyncThunk('@apt/STATUS', async (packageName: string) => {
  console.log('dpkg query called on ', packageName)
  return true
})
export const searchNames = createAsyncThunk('@apt/SEARCH_NAMES', async (packageName: string) => {
  console.log('searchNames called on ', packageName)
  return ['asd', 'sdsa']
})
export const search = createAsyncThunk('@apt/SEARCH', async (packageNames: string[]) => {
  console.log('search called on ', packageNames)
  return ['asdasdasd', 'asdasd']
})
