import { createReducer } from '@reduxjs/toolkit'
import { PreviewsActions } from '../actions'
import { PackagePreview } from '../actions/apt'

export default createReducer(Array<PackagePreview | null>(5), builder =>
  builder
    .addCase(PreviewsActions.setPreview, (previews, { payload: { preview, index } }) => {
      previews[index] = preview
      return previews
    })
    .addCase(PreviewsActions.clear, () => Array<PackagePreview | null>(5))
)
