import { pop } from './queue'
import { exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { promisify } from 'util'
import { QueueNode } from '../containers/Queue'

const PSC_FINISHED = '__PSC_FINISHED'
const prExec = promisify(exec)

export type Preview = {
  name: string
  description: string
}

export const process = createAsyncThunk('@apt/PROCESS', async (packages: QueueNode[], thunkAPI) => {
  try {
    const prepared = packages
      .map(({ flag, name }: QueueNode) => `apt ${flag} -y ${name}; echo ${PSC_FINISHED}`)
      .join(';')
    const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
    if (!stdout || !stderr) return thunkAPI.rejectWithValue(new Error('Failed to host shell'))

    stderr.on('data', chunk => {
      const line = chunk as string
      thunkAPI.rejectWithValue(line)
    })

    for await (const chunk of stdout) {
      const line = chunk as string
      console.log(line)
      if (line.match(PSC_FINISHED)) thunkAPI.dispatch(pop())
    }
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
  return
})
export const status = createAsyncThunk('@apt/STATUS', async (packageName: string) => {
  try {
    const { stdout, stderr } = await prExec(`dpkg-query -W ${packageName}`)
    return stdout.length !== 0 || stderr.length === 0
  } catch (e) {
    return false
  }
})
export const searchPreviews = createAsyncThunk(
  '@apt/SEARCH_PREVIEWS',
  async (packageName: string, thunkAPI) => {
    try {
      const { stdout, stderr } = await prExec(`apt-cache search --names-only ${packageName}`)
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
  try {
    const { stdout, stderr } = await prExec(`apt-cache show ${packageName}`)
    if (stderr) {
      return thunkAPI.rejectWithValue(stderr)
    }
    return stdout
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})
