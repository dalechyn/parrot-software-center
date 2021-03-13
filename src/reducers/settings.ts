import fs from 'fs'
import { createReducer } from '@reduxjs/toolkit'
import { SettingsActions } from '../actions'
import { Settings } from '../types/settings'

const { HOME } = process.env
const PSCDir = `${HOME}/.parrotstore`

let initialSettings: Settings
try {
  initialSettings = JSON.parse(fs.readFileSync(`${PSCDir}/settings.json`, 'utf-8'))
} catch {
  initialSettings = {
    loadCVEs: true,
    darkTheme: false,
    APIUrl: process.env.NODE_ENV === 'development' ? 'localhost' : 'http://165.227.140.210:8000/'
  }
}

const saveSettings = async (settings: Settings) => {
  if (!fs.existsSync(PSCDir)) {
    try {
      await fs.promises.mkdir(PSCDir)
    } catch (e) {
      console.warn('Error when creating .parrotstore directory. Do you have proper rights?')
    }
  }
  try {
    await fs.promises.writeFile(`${PSCDir}/settings.json`, JSON.stringify(settings))
  } catch (e) {
    console.warn(`Error while saving settings - ${e}`)
  }
}

export default createReducer<Settings>(initialSettings, builder =>
  builder.addCase(SettingsActions.save, (state, { payload }) => {
    const settings = {
      ...state,
      ...payload
    }
    if (!HOME) console.warn(`HOME is not defined, settings won't save`)
    else saveSettings(settings)

    return settings
  })
)
