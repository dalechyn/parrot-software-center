import { AptActions } from '../../actions'
import { createReducer } from '@reduxjs/toolkit'

export default createReducer({}, builder =>
  builder
    .addCase(AptActions.install.fulfilled, () => {
      console.log('aptactions fulfilled')
    })
    .addCase(AptActions.uninstall.fulfilled, () => {
      console.log('aptactions fulfilled')
    })
    .addCase(AptActions.status.fulfilled, () => {
      console.log('aptactions fulfilled')
    })
    .addCase(AptActions.searchNames.fulfilled, () => {
      console.log('aptactions fulfilled')
    })
)
