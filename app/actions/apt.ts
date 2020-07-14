import { pop } from './queue'
import { exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { promisify } from 'util'
import { AlertActions } from '../actions'
import { QueueNode } from '../containers/Queue'
import { Readable } from 'stream'
import leven from 'leven'

const PSC_FINISHED = '__PSC_FINISHED'
const prExec = promisify(exec)

export type Preview = {
  name: string
  description: string
}

const waitStdoe = (stderr: Readable, stdout: Readable) =>
  Promise.race([
    new Promise(resolve => stdout.on('close', resolve)),
    new Promise((_, reject) =>
      stderr.on('data', chunk => {
        const line = chunk as string
        reject(new Error(line))
      })
    )
  ])

export const checkUpdates = createAsyncThunk('@apt/CHECK_UPDATES', async (_, thunkAPI) => {
  try {
    const { stdout } = await prExec("apt list --upgradable | egrep -o '^[a-z0-9.+-]+'")
    const res = stdout.split('\n')
    return res.splice(0, res.length - 1)
  } catch (e) {
    thunkAPI.dispatch(AlertActions.set(e))
    throw e
  }
})

export const process = createAsyncThunk('@apt/PROCESS', async (packages: QueueNode[], thunkAPI) => {
  const prepared = packages
    .map(({ flag, name }: QueueNode) => `apt ${flag} -y ${name}; echo ${PSC_FINISHED}`)
    .join(';')
  try {
    const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
    if (!stdout || !stderr) throw new Error('Failed to host shell')

    for await (const chunk of stdout) {
      const line = chunk as string
      console.log(line)
      if (line.match(PSC_FINISHED)) thunkAPI.dispatch(pop())
    }

    await waitStdoe(stderr, stdout)
  } catch (e) {
    thunkAPI.dispatch(AlertActions.set(e))
    throw e
  }
})
export const status = createAsyncThunk('@apt/STATUS', async (packageName: string) => {
  try {
    const { stdout, stderr } = await prExec(`dpkg-query -W ${packageName}`)
    return stdout.length !== 0 || stderr.length === 0
  } catch (e) {
    return false
  }
})
export const checkUpgradable = createAsyncThunk(
  '@apt/CHECK_UPGRADABLE',
  async (packageName: string) => {
    try {
      const { stdout } = await prExec(
        `apt-cache policy ${packageName} | egrep "(Installed|Candidate)" | cut -c 14-`
      )
      const [current, candidate] = stdout.split('\n').slice(0, 2)
      return current !== candidate
    } catch (e) {
      return false
    }
  }
)

export const searchPreviews = createAsyncThunk(
  '@apt/SEARCH_PREVIEWS',
  async (packageName: string, thunkAPI) => {
    try {
      const { stdout } = await prExec(`apt-cache search --names-only ${packageName}`)
      const names = stdout.split('\n')
      // additional sorting is needed because search
      // doesn't guarantee that queried package will be first in the list
      return names
        .slice(0, names.length - 1)
        .map(str => {
          const res = str.split(/ - /)
          const preview: Preview = {
            name: res[0],
            description: res[1]
          }
          return preview
        })
        .sort((a, b) => leven(a.name, packageName) - leven(b.name, packageName))
    } catch (e) {
      thunkAPI.dispatch(AlertActions.set(e))
      throw e
    }
  }
)
export const search = createAsyncThunk('@apt/SEARCH', async (packageName: string, thunkAPI) => {
  try {
    const { stdout } = await prExec(`apt-cache show ${packageName}`)
    return stdout
  } catch (e) {
    thunkAPI.dispatch(AlertActions.set(e))
    throw e
  }
})
