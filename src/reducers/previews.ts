import { createReducer } from '@reduxjs/toolkit'
import { PreviewsActions } from '../actions'
import { PackagePreview } from '../types/apt'

export default createReducer(Array<PackagePreview | null | undefined>(), builder =>
  builder
    .addCase(PreviewsActions.setPreview, (previews, { payload: { preview, index } }) => {
      previews[index] = preview
      return previews
    })
    .addCase(PreviewsActions.clear, () => Array<PackagePreview | null | undefined>())
)
