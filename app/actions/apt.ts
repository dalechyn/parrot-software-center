import { promisify } from 'util'
import { exec as _exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'

const exec = promisify(_exec)

export const install = createAsyncThunk('@apt/INSTALL', async (packageName: string, thunkAPI) => {
  console.log('apt install called on ', packageName)
  try {
    const { stderr } = await exec(`apt install ${packageName}`)
    if (stderr) {
      return thunkAPI.rejectWithValue(stderr)
    }
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
  return
})
export const uninstall = createAsyncThunk(
  '@apt/UNINSTALL',
  async (packageName: string, thunkAPI) => {
    console.log('apt uninstall called on ', packageName)
    try {
      const { stderr } = await exec(`apt purge ${packageName}`)
      if (stderr) {
        return thunkAPI.rejectWithValue(stderr)
      }
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
    return
  }
)
export const status = createAsyncThunk('@apt/STATUS', async (packageName: string) => {
  console.log('dpkg query called on ', packageName)
  try {
    const { stdout, stderr } = await exec(`dpkg-query -W ${packageName}`)
    return stdout.length === 0 || stderr.length !== 0
  } catch (e) {
    return false
  }
})
export const searchNames = createAsyncThunk(
  '@apt/SEARCH_NAMES',
  async (packageName: string, thunkAPI) => {
    console.log('searchNames called on ', packageName)
    try {
      const { stdout, stderr } = await exec(
        `apt-cache search --names-only ${packageName} | egrep -o '^([a-z0-9.-]*)'`
      )
      if (stderr) {
        return thunkAPI.rejectWithValue(stderr)
      }
      return stdout.split('\n')
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  }
)
export const search = createAsyncThunk('@apt/SEARCH', async (packageNames: string[], thunkAPI) => {
  console.log('search called on ', packageNames)
  try {
    const { stdout, stderr } = await exec(`apt-cache show ${packageNames.join(' ')}`)
    if (stderr) {
      return thunkAPI.rejectWithValue(stderr)
    }
    return stdout.split('\n\n')
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})
