import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit'
import { fetchAuthorized } from './fetch'

export type ReportInfo = {
  date: number
  reportedUser: string
  commentary: string
  packageName: string
  reportedBy: string
  review: string
  reviewed: boolean
  reviewedBy: string
  reviewedDate: number
}

export const deleteReview = createAsyncThunk<
  void,
  { packageName: string; author: string },
  { state: RootState }
>('@review/DELETE_REVIEW', async ({ packageName, author }, { getState, dispatch }) => {
  const state = getState()

  const wrapped = await dispatch(
    fetchAuthorized({
      input: `${state.settings.APIUrl}/delete`,
      payload: {
        package: packageName,
        author
      }
    })
  )
  const res = unwrapResult(wrapped)
  if (!res.ok) throw new Error(res.statusText)
})
export const reportReview = createAsyncThunk<
  void,
  Pick<ReportInfo, 'commentary' | 'reportedUser' | 'packageName'>,
  { state: RootState }
>(
  '@review/REPORT_REVIEW',
  async ({ reportedUser, commentary, packageName }, { getState, dispatch }) => {
    const state = getState()
    const wrapped = await dispatch(
      fetchAuthorized({
        input: `${state.settings.APIUrl}/report`,
        payload: { reportedUser, commentary, packageName }
      })
    )
    const res = unwrapResult(wrapped)
    if (!res.ok) throw new Error(res.statusText)
  }
)
export const getReports = createAsyncThunk<ReportInfo[], boolean, { state: RootState }>(
  '@review/GET_REPORTS',
  async (showReviewed: boolean, { getState, dispatch }) => {
    const state = getState()
    const wrapped = await dispatch(
      fetchAuthorized({
        input: `${state.settings.APIUrl}/reports`,
        payload: {
          showReviewed
        }
      })
    )
    const res = unwrapResult(wrapped)
    if (!res.ok) throw new Error(res.statusText)
    return ((await res.json()) as unknown) as ReportInfo[]
  }
)
export const reviewReport = createAsyncThunk<
  void,
  Pick<ReportInfo, 'packageName' | 'reportedBy' | 'reportedUser' | 'reviewedBy' | 'review'> & {
    deleteReview: boolean
    ban: boolean
  },
  { state: RootState }
>('@review/REVIEW_REPORT', async (report, { getState, dispatch }) => {
  const state = getState()
  const wrapped = await dispatch(
    fetchAuthorized({
      input: `${state.settings.APIUrl}/reviewReport`,
      payload: {
        ...report
      }
    })
  )
  const res = unwrapResult(wrapped)
  if (!res.ok) throw new Error(res.statusText)
})
