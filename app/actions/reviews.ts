import { createAsyncThunk } from '@reduxjs/toolkit'

export type ReportInfo = {
  reportedUser: string
  commentary: string
  packageName: string
  reportedBy: string
  review: string
  reviewed: boolean
  reviewedBy: string
  reviewedDate: string
}
export const deleteReview = createAsyncThunk<
  void,
  { packageName: string; author: string },
  { state: RootState }
>('@review/DELETE_REVIEW', async ({ packageName, author }, { getState }) => {
  const state = getState()
  const res = await fetch(`${state.settings.APIUrl}/delete`, {
    method: 'POST',
    body: JSON.stringify({ package: packageName, author, token: state.auth.token })
  })
  if (!res.ok) throw new Error(res.statusText)
})
export const reportReview = createAsyncThunk<
  void,
  Pick<ReportInfo, 'commentary' | 'reportedUser' | 'packageName'>,
  { state: RootState }
>('@review/REPORT_REVIEW', async ({ reportedUser, commentary, packageName }, { getState }) => {
  const state = getState()
  const res = await fetch(`${state.settings.APIUrl}/report`, {
    method: 'POST',
    body: JSON.stringify({ reportedUser, commentary, token: state.auth.token, packageName })
  })
  if (!res.ok) throw new Error(res.statusText)
})
export const getReports = createAsyncThunk<ReportInfo[], void, { state: RootState }>(
  '@review/GET_REPORTS',
  async (_: void, { getState }) => {
    const state = getState()
    const res = await fetch(`${state.settings.APIUrl}/reports`, {
      method: 'POST',
      body: JSON.stringify({ token: state.auth.token })
    })
    if (!res.ok) throw new Error(res.statusText)
    return ((await res.json()) as unknown) as ReportInfo[]
  }
)
export const reviewReport = createAsyncThunk<void, ReportInfo, { state: RootState }>(
  '@review/REVIEW_REPORT',
  async (report, { getState }) => {
    const state = getState()
    const res = await fetch(`${state.settings.APIUrl}/reviewReport`, {
      method: 'POST',
      body: JSON.stringify({ token: state.auth.token, ...report })
    })
    if (!res.ok) throw new Error(res.statusText)
  }
)
