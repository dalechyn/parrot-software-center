import { promisify } from 'util'
import { exec as _exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { exec as _sudoExec } from 'sudo-prompt'

const exec = promisify(_exec)
const sudoExec = promisify(_sudoExec)

export type Preview = {
  name: string
  description: string
}

export const install = createAsyncThunk('@apt/INSTALL', async (packageName: string, thunkAPI) => {
  console.log('apt install called on ', packageName)
  try {
    const { stderr } = await sudoExec(`apt install -y ${packageName}`, { name: 'pscinstall' })
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
      const { stderr } = await sudoExec(`apt purge -y ${packageName}`, { name: 'pscuninstall' })
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
    return stdout.length !== 0 || stderr.length === 0
  } catch (e) {
    return false
  }
})
export const searchPreviews = createAsyncThunk(
  '@apt/SEARCH_PREVIEWS',
  async (packageName: string, thunkAPI) => {
    console.log('searchPreviews called on ', packageName)
    try {
      const { stdout, stderr } = await exec(`apt-cache search --names-only ${packageName}`)
      if (stderr) {
        return thunkAPI.rejectWithValue(stderr)
      }
      return stdout.split('\n').map(str => {
        const res = str.split(/ - /)
        const preview: Preview = {
          name: res[0],
          description: res[1]
        }
        return preview
      })
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  }
)
export const search = createAsyncThunk('@apt/SEARCH', async (packageName: string, thunkAPI) => {
  console.log('search called on ', packageName)
  try {
    const { stdout, stderr } = await exec(`apt-cache show ${packageName}`)
    if (stderr) {
      return thunkAPI.rejectWithValue(stderr)
    }
    return stdout
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})
