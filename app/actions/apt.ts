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

export const upgrade = createAsyncThunk('@apt/UPGRADE', async () => {
  // ADDED -s for developing purposes, it will be removed after Terminal component will work right.
  const { stderr, stdout } = exec('pkexec sh -c "apt-get -s update && apt-get -s -y dist-upgrade"')
  if (!stdout || !stderr) throw new Error('Failed to host shell')

  stderr.on('data', chunk => {
    const line = chunk as string
    throw new Error(line)
  })

  return stdout
})

export const checkUpdates = createAsyncThunk('@apt/CHECK_UPDATES', async () => {
  const { stdout, stderr } = await prExec(
    'apt-get -s -o Debug::NoLocking=true upgrade | grep ^Inst | cut -c 6-'
  )
  if (stderr) throw new Error(stderr)
  return stdout.split('\n').length - 1
})

export const process = createAsyncThunk('@apt/PROCESS', async (packages: QueueNode[], thunkAPI) => {
  const prepared = packages
    .map(({ flag, name }: QueueNode) => `apt ${flag} -y ${name}; echo ${PSC_FINISHED}`)
    .join(';')
  const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
  if (!stdout || !stderr) throw new Error('Failed to host shell')

  stderr.on('data', chunk => {
    const line = chunk as string
    throw new Error(line)
  })

  for await (const chunk of stdout) {
    const line = chunk as string
    console.log(line)
    if (line.match(PSC_FINISHED)) thunkAPI.dispatch(pop())
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
  async (packageName: string) => {
    const { stdout, stderr } = await prExec(`apt-cache search --names-only ${packageName}`)
    if (stderr) {
      throw new Error(stderr)
    }
    const names = stdout.split('\n')
    return names.slice(0, names.length - 1).map(str => {
      const res = str.split(/ - /)
      const preview: Preview = {
        name: res[0],
        description: res[1]
      }
      return preview
    })
  }
)
export const search = createAsyncThunk('@apt/SEARCH', async (packageName: string) => {
  const { stdout, stderr } = await prExec(`apt-cache show ${packageName}`)
  if (stderr) {
    throw new Error(stderr)
  }
  return stdout
})
