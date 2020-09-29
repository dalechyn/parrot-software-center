import { exec } from 'child_process'
import { createAsyncThunk, Dispatch } from '@reduxjs/toolkit'
import { promisify } from 'util'
import { AlertActions, PreviewsActions } from '../actions'
import { QueueNode } from '../containers/Queue'
import { Readable } from 'stream'
import leven from 'leven'
import { CVEEndpoint } from '../components/SearchPreviewList'
import { pop, QueueNodeMeta } from './queue'

export const INSTALL = 'install'
export const UPGRADE = '--only-upgrade install'
export const UNINSTALL = 'remove'
const PSC_FINISHED = '__PSC_FINISHED'
const prExec = promisify(exec)

export type Review = {
  author: string
  rating: number
  commentary: string
}

export type CVEInfo = {
  critical: number
  high: number
  medium: number
  low: number
}

export type Sources = 'APT' | 'SNAP'

export type PackageSource = {
  packageSource: Sources
}
export type AptPackageRequiredFields = {
  name: string
  version: string
  maintainer: string
  description: string
}

export type AptPackageOptionalFields = Partial<{
  section: string
  priority: string
  essential: string
  architecture: string
  origin: string
  bugs: string
  homepage: string
  tag: string
  source: string
  depends: string
  preDepends: string
  recommends: string
  suggests: string
  breaks: string
  conflicts: string
  replaces: string
  provides: string
  installedSize: string
  downloadSize: string
  aptManualInstalled: string
  aptSources: string
}>

export type PackageStatus = {
  installed: boolean
  upgradable: boolean
  upgradeQueued: boolean
} & Partial<Pick<QueueNode, 'flag'>>

export type PackagePreview = {
  name: string
  description: string
  cveInfo: CVEInfo
  version: string
} & PackageStatus &
  Pick<PackageEssentials, 'rating'> &
  PackageSource

export type PackageEssentials = {
  reviews: Review[]
  screenshots: string[]
  rating: number
}

export type AptPackage = AptPackageRequiredFields &
  AptPackageOptionalFields &
  PackageStatus &
  PackageEssentials

export type SnapChannel = {
  risk: string
  branch?: string
  version: string
}

export type SnapTrack = {
  name: string
  channels: SnapChannel[]
}

export type SnapPackage = {
  name: string
  summary: string
  publisher: string
  storeUrl: string
  contact: string
  license: string
  description: string
  snapId: string
  refreshDate?: string
  tracking?: string
  tracks: SnapTrack[]
} & PackageEssentials &
  PackageStatus

type AptPkgRegexRequired = {
  [K in keyof AptPackageRequiredFields]: RegExp
}

type AptPkgRegexOptional = {
  [K in keyof Required<AptPackageOptionalFields>]: RegExp
}

const aptPkgRegex: {
  required: AptPkgRegexRequired
  optional: AptPkgRegexOptional
} = {
  required: {
    name: /^Package: ([a-z0-9.+-]+)/m,
    version: /^Version: ((?<epoch>[0-9]{1,4}:)?(?<upstream>[A-Za-z0-9~.]+)(?:-(?<debian>[A-Za-z0-9~.]+))?)/m,
    // eslint-disable-next-line no-control-regex
    maintainer: /^Maintainer: ((?<name>(?:[\S ]+\S+)) <(?<email>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)]))>)/m,
    description: /^Description-(?:[a-z]{2}): (.*(?:\n \S.*)*)/m
  },
  optional: {
    section: /^Section: ([a-z]+)/m,
    priority: /^Priority: (\S+)/m,
    essential: /^Essential: (yes|no)/m,
    architecture: /^Architecture: (.*)/m,
    origin: /^Origin: ([a-z0-9.+-]+)/m,
    bugs: /^Bugs: ((?:[a-z]+:\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/m,
    homepage: /^Homepage: ((?:[a-z]+:\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/m,
    tag: /^Tag: ((?: ?[A-Za-z-+:]*(?:,(?:[ \n])?)?)+)/m,
    source: /^Source: ([a-zA-Z0-9-+.]+)/m,
    depends: /^Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    preDepends: /^Pre-Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    recommends: /^Recommends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    suggests: /^Suggests: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    breaks: /^Breaks: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    conflicts: /^Conflicts: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    replaces: /^Replaces: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    provides: /^Provides: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    installedSize: /^Installed-Size: (.*)/m,
    downloadSize: /^Download-Size: (.*)/m,
    aptManualInstalled: /^APT-Manual-Installed: (.*)/m,
    aptSources: /^APT-Sources: ((?:[a-z]+:\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/m
  }
}

const snapPkgRegex = {
  name: /^name: +(.*)/m,
  summary: /^summary: +(.*)/m,
  publisher: /^publisher: +(.*)/m,
  storeUrl: /^store-url: +(.*)/m,
  contact: /^contact: +(.*)/m,
  license: /^license: +(.*)/m,
  description: /^description: \|\n((?:  .*\n)+)/m,
  snapId: /^snap-id: +(.*)/m,
  refreshDate: /^refresh-date: (.*)/m,
  channels: /^channels:\n((?:.*\n)+)/m,
  installed: /^installed: +(.*)  +(.*) *\n?/m
}

const waitStdoe = (stderr: Readable, stdout: Readable, dispatch: Dispatch) => {
  let lastStderrLine: string
  let lastStderr: boolean

  stdout.on('data', chunk => {
    lastStderr = false
    const line = chunk as string
    console.log(line)
    if (line.match(PSC_FINISHED)) dispatch(pop())
  })

  stderr.on('data', chunk => {
    lastStderr = true
    lastStderrLine = chunk as string
  })
  return new Promise((resolve, reject) => {
    stdout.on('close', () => {
      resolve()
    })
    stderr.on('close', () => {
      if (lastStderr) reject(new Error(lastStderrLine))
    })
  })
}

export const perform = createAsyncThunk(
  '@apt/PERFORM ',
  async (packages: QueueNode[], { dispatch }) => {
    const prepared = packages
      .map(
        ({ flag, name, source, version }: QueueNode) =>
          (source === 'APT'
            ? `LANG=C DEBIAN_FRONTEND=noninteractive apt-get ${flag} -y ${name}${
                flag === INSTALL ? `=${version}` : ''
              }`
            : `LANG=C snap ${flag === UPGRADE ? 'refresh' : flag} ${name}${
                flag === INSTALL ? ` --channel=${version.split(':')[0]}` : ''
              }`) + `;echo ${PSC_FINISHED}`
      )
      .join(';')
    try {
      const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
      if (!stdout || !stderr) throw new Error('Failed to host shell')

      // we need to subscribe to events before we do anything on the channels
      await waitStdoe(stderr, stdout, dispatch)

      /*  for await (const chunk of stderr) {
        throw new Error(chunk as string)
      }
*/
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const checkUpdates = createAsyncThunk('@apt/CHECK_UPDATES', async () => {
  try {
    const { stdout } = await prExec('LANG=C apt list --upgradable')
    const regex = /^([a-z0-9.+-]+)\/(?:[a-z-],?)+ (?:[0-9]:)?((?:[0-9]{1,4}:)?(?:(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?))/gm

    const res: QueueNodeMeta[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(stdout)))
      res.push({ name: match[1], version: match[2], source: 'APT' })

    return res.filter(
      (x, i) => i === res.findIndex(el => x.name === el.name && x.source === el.source)
    )
  } catch (e) {
    return []
  }
})

const redhatCVEEndpoint: CVEEndpoint = {
  api: 'https://access.redhat.com/hydra/rest/securitydata/cve.json?',
  handleResponse: async (res: Response) => {
    let low = 0
    let medium = 0
    let high = 0
    let critical = 0

    const json = await res.json()

    if (Array.isArray(json))
      // eslint-disable-next-line @typescript-eslint/camelcase
      json.forEach(({ cvss3_score: score }) => {
        if (score >= 0 && score < 4) low++
        else if (score < 7) medium++
        else if (score < 9) high++
        else critical++
      })

    return { low, medium, high, critical }
  }
}

export const fetchAutocompletion = createAsyncThunk<string[], string, { state: RootState }>(
  '@apt/FETCH_AUTOCOMPLETION',
  async (packageName, { dispatch }) => {
    try {
      const [{ stdout: aptStdout }, { stdout: snapStdOut }] = await Promise.all([
        prExec(`LANG=C apt-cache search --names-only ${packageName}`),
        // currently there are no stable ways to fetch a socket in node.js :(
        // see https://github.com/node-fetch/node-fetch/issues/336
        // I don't really want to use connections as I'd deal with streams and there is always risk to loose data
        // especially in such fast requests. However those critical parts should be rewritten in C/Python bindings in
        // future
        prExec(
          `curl -sS --unix-socket /run/snapd.socket http://localhost/v2/find?q=${packageName} -X GET`
        )
      ])
      const aptNames = aptStdout.split('\n')
      // additional sorting is needed because search
      // doesn't guarantee that queried package will be first in the list
      const snapResults = JSON.parse(snapStdOut)
      return [
        // to avoid duplicates among snap and apt
        ...new Set([
          ...aptNames.slice(0, aptNames.length - 1).map(str => str.split(/ - /)[0]),
          ...snapResults.result.map((el: { name: string }) => el.name)
        ])
      ].sort((a, b) => leven(a, packageName) - leven(b, packageName))
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const fetchPreviews = createAsyncThunk<
  number,
  { name: string; chunk: number },
  { state: RootState }
>('@apt/FETCH_PREVIEWS', async ({ name: packageName, chunk }, { getState, dispatch }) => {
  const { queue, settings } = getState()
  dispatch(PreviewsActions.clear())
  try {
    const [{ stdout: aptResult }, { stdout: snapResult }] = await Promise.all([
      prExec(`LANG=C apt search ${packageName}`),
      prExec(`LANG=C snap find ${packageName}`)
    ])

    // additional sorting is needed because search
    // doesn't guarantee that queried package will be first in the list
    const names = [
      ...aptResult
        .split('\n\n')
        .slice(2, -1)
        .reduce((result, str) => {
          const match = /([a-z0-9.+-]+)\/((?:[a-z0-9.+-]+,?)+) (?:[0-9]:)?([a-zA-Z0-9-.~+-]+) ([a-z0-9-+]*)(?: ?\[.*\])?\n  (.*)/m.exec(
            str
          )
          if (!match || !match[1] || !match[3] || !match[5])
            console.error(`Unexpected error in apt preview parsing: ${str}`)
          else result.push([match[1], match[3], match[5], 'APT'])
          return result
        }, Array<Array<string>>()),
      ...snapResult
        .split('\n')
        .slice(1, -1)
        .reduce((result, str) => {
          const res = /(^[a-zA-Z0-9-]+) +([a-zA-Z0-9-.~+-]+) +([a-zA-Z0-9-*.]+) +(-|[a-zA-Z0-9-]+) +(.*)/gm.exec(
            str
          )
          if (!res || !res[1] || !res[5])
            console.error(`Unexpected error in snap preview parsing: ${str}`)
          else result.push([res[1], res[2], res[5], 'SNAP'])
          return result
        }, Array<Array<string>>())
    ].sort((a, b) => leven(a[0], packageName) - leven(b[0], packageName))

    const length = names.length
    const slicedRawPreviews = names.slice((chunk - 1) * 5, chunk * 5)

    for (let i = 4; i >= slicedRawPreviews.length; i--) {
      dispatch(PreviewsActions.setPreview({ preview: null, index: i }))
    }

    slicedRawPreviews
      .map(async ([name, version, description, source]) => {
        const preview: PackagePreview = {
          name,
          description,
          version,
          packageSource: source as Sources,
          installed: false,
          upgradable: false,
          upgradeQueued: false,
          rating: -1,
          cveInfo: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          }
        }
        const foundPackage = queue.packages.find((pkg: QueueNode) => packageName === pkg.name)
        if (foundPackage) {
          preview.flag = foundPackage.flag
          if (foundPackage.flag === UPGRADE) {
            preview.upgradeQueued = true
            preview.upgradable = true
          } else if (foundPackage.flag === INSTALL) {
            preview.installed = true
          }
        } else {
          try {
            if (source === 'APT') {
              const { stdout, stderr } = await prExec(`LANG=C && dpkg-query -W ${name}`)
              if (stdout.length !== 0 || stderr.length === 0) {
                preview.installed = true
                const { stdout } = await prExec(
                  `LANG=C apt-cache policy ${name} | egrep "(Installed|Candidate)" | cut -c 14-`
                )
                const [current, candidate] = stdout.split('\n').slice(0, 2)
                if (current !== candidate) preview.upgradable = true
              }
            } else if (source === 'SNAP') {
              const { stdout: snapInfo } = await prExec(`LANG=C snap info ${packageName}`)
              if (snapPkgRegex.installed.test(snapInfo)) preview.installed = true
              const { stdout, stderr } = await prExec(
                `LANG=C snap refresh --list | sed 1d | grep ${packageName}`
              )
              if (stdout.length !== 0 || stderr.length === 0) {
                preview.upgradable = true
              }
            }
          } catch {}
        }

        try {
          const ratingsResponse = await fetch(`${settings.APIUrl}/ratings/${name}`)
          preview.rating = (await ratingsResponse.json()).rating
        } catch {
          preview.rating = 0
        }

        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        if (settings.loadCVEs)
          preview.cveInfo = await redhatCVEEndpoint.handleResponse(
            await fetch(`${redhatCVEEndpoint.api}package=${name}&after=${monthAgo.toISOString()}`, {
              method: 'GET'
            })
          )
        return preview
      })
      .map((pr, i) =>
        (async () => {
          dispatch(PreviewsActions.setPreview({ preview: await pr, index: i }))
        })()
      )

    return length
  } catch (e) {
    dispatch(AlertActions.set(e.message))
    throw e
  }
})

export const fetchSnapPackage = createAsyncThunk<SnapPackage, string, { state: RootState }>(
  '@apt/FETCH_SNAP_PACKAGE',
  async (packageName, { getState, dispatch }) => {
    const { queue, settings } = getState()
    const newPackage: SnapPackage = {
      name: '',
      summary: '',
      publisher: '',
      storeUrl: '',
      contact: '',
      license: '',
      description: '',
      snapId: '',
      tracks: [],
      rating: -1,
      screenshots: [],
      reviews: [],
      installed: false,
      upgradable: false,
      upgradeQueued: false
    }
    try {
      const { stdout: snapResult } = await prExec(`LANG=C snap info ${packageName}`)

      const omitted = { ...snapPkgRegex }
      delete omitted['channels']
      delete omitted['installed']

      Object.keys(omitted)
        .slice(0, -1)
        .every(prop => {
          const key = prop as keyof Omit<typeof snapPkgRegex, 'channels' | 'installed'>
          const match = omitted[key].exec(snapResult)
          if (match) newPackage[key] = match[1]
          else console.warn(`Missing ${key}`)
          return match
        })

      const channelsMatch = snapPkgRegex.channels.exec(snapResult)
      if (channelsMatch) {
        const trackRegex = / *(?:(?<track>[0-9.a-z]+)\/)(?<risk>[0-9a-z]+)(?:\/(?<branch>[0-9a-z]+))?: +(?:(?<version>[0-9.a-z~+-]+|[–↑]) +(?<essential>.*)?) *\n?/gm
        const tracks: SnapTrack[] = []
        let channels: SnapChannel[] = []

        let match = trackRegex.exec(channelsMatch[1])
        if (match && match.groups) {
          let lastTrack = match.groups['track']
          let lastVersion = match.groups['version']
          do {
            if (lastTrack !== match.groups['track']) {
              tracks.push({
                name: lastTrack,
                channels
              })
              lastTrack = match.groups['track']
              channels = []
            }
            if (lastVersion !== match.groups['version'] && match.groups['version'] !== '↑')
              lastVersion = match.groups['version']
            if (match.groups['version'] !== '--')
              channels.push({
                risk: match.groups['risk'] ?? '',
                ...(match.groups['branch'] ? { branch: match.groups['branch'] } : {}),
                version: lastVersion
              })
          } while ((match = trackRegex.exec(channelsMatch[1])) && match.groups)
          if (!tracks.length && channels.length)
            tracks.push({
              name: lastTrack,
              channels
            })
        }
        newPackage.tracks = tracks
      } else console.warn('Missing channels')

      const foundPackage = queue.packages.find(
        (pkg: QueueNode) => packageName === pkg.name && pkg.source == 'SNAP'
      )
      if (foundPackage) {
        newPackage.flag = foundPackage.flag
        if (foundPackage.flag === UPGRADE) {
          newPackage.upgradable = true
          newPackage.upgradeQueued = true
        } else if (foundPackage.flag === INSTALL) {
          newPackage.installed = true
        }
      } else {
        if (snapPkgRegex.installed.test(snapResult)) newPackage.installed = true
        try {
          const { stdout, stderr } = await prExec(
            `LANG=C snap refresh --list | sed 1d | grep ${packageName}`
          )
          if (stdout.length !== 0 || stderr.length === 0) {
            newPackage.upgradable = true
          }
        } catch (e) {}
      }

      try {
        const ratingsResponse = await fetch(`${settings.APIUrl}/ratings/${packageName}`)
        newPackage.rating = (await ratingsResponse.json()).rating
      } catch {
        newPackage.rating = 0
      }

      try {
        const reviewsResponse = await fetch(`${settings.APIUrl}/reviews/${packageName}`)
        newPackage.reviews = await reviewsResponse.json()
      } catch {}

      try {
        newPackage.screenshots = (
          await (await fetch(`https://screenshots.debian.net/json/package/${packageName}`)).json()
        ).screenshots.map(
          (s: { small_image_url: string; large_image_url: string }) => s.large_image_url
        )
      } catch (e) {}
      return newPackage
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const fetchAptPackage = createAsyncThunk<AptPackage, string, { state: RootState }>(
  '@apt/FETCH_APT_PACKAGE',
  async (packageName, { getState, dispatch }) => {
    const { queue, settings } = getState()
    const newPackage: AptPackage = {
      name: '',
      description: '',
      installed: false,
      upgradable: false,
      upgradeQueued: false,
      version: '',
      maintainer: '',
      rating: -1,
      reviews: [],
      screenshots: []
    }

    try {
      const { stdout: aptResult } = await prExec(`LANG=C apt-cache show ${packageName}`)

      if (
        !Object.keys(aptPkgRegex.required).every(prop => {
          const key = prop as keyof typeof aptPkgRegex.required
          const match = aptPkgRegex.required[key].exec(aptResult)
          if (match) newPackage[key] = match[1]
          else console.warn(`Missing ${key}`)
          return match
        })
      ) {
        throw new Error('Required fields are missing, skipping invalid package')
      }
      Object.keys(aptPkgRegex.optional).forEach(prop => {
        const key = prop as keyof Omit<typeof aptPkgRegex.optional, 'source'>
        const match = aptPkgRegex.optional[key].exec(aptResult)
        if (match) newPackage[key] = match[1]
        else console.warn(`Missing ${key}`)
      })

      // Guessing if the package is installed
      const foundPackage = queue.packages.find((pkg: QueueNode) => packageName === pkg.name)
      if (foundPackage) {
        newPackage.flag = foundPackage.flag
        if (foundPackage.flag === UPGRADE) {
          newPackage.upgradable = true
          newPackage.upgradeQueued = true
        } else if (foundPackage.flag === INSTALL) {
          newPackage.installed = true
        }
      } else {
        try {
          const { stdout, stderr } = await prExec(`LANG=C dpkg-query -W ${packageName}`)
          if (stdout.length !== 0 || stderr.length === 0) {
            newPackage.installed = true
            const { stdout } = await prExec(
              `LANG=C && apt-cache policy ${packageName} | egrep "(Installed|Candidate)" | cut -c 14-`
            )
            const [current, candidate] = stdout.split('\n').slice(0, 2)
            if (current !== candidate) newPackage.upgradable = true
          }
        } catch (e) {}
      }

      try {
        const ratingsResponse = await fetch(`${settings.APIUrl}/ratings/${packageName}`)
        newPackage.rating = (await ratingsResponse.json()).rating
      } catch {
        newPackage.rating = 0
      }

      try {
        const reviewsResponse = await fetch(`${settings.APIUrl}/reviews/${packageName}`)
        newPackage.reviews = await reviewsResponse.json()
      } catch {}

      try {
        newPackage.screenshots = (
          await (await fetch(`https://screenshots.debian.net/json/package/${packageName}`)).json()
        ).screenshots.map(
          (s: { small_image_url: string; large_image_url: string }) => s.large_image_url
        )
      } catch (e) {}

      return newPackage
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const rate = createAsyncThunk<
  void,
  { name: string; token: string; commentary: string; rating: number },
  { state: RootState }
>('@apt/RATE', async (rateInfo, { getState }) => {
  await fetch(`${getState().settings.APIUrl}/rate`, {
    method: 'PUT',
    body: JSON.stringify(rateInfo)
  })
})
