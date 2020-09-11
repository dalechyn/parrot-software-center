import { exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { promisify } from 'util'
import { AlertActions, PreviewsActions } from '../actions'
import { QueueNode } from '../containers/Queue'
import { Readable } from 'stream'
import leven from 'leven'
import { CVEEndpoint } from '../components/SearchPreviewList'
import { pop } from './queue'

const PSC_FINISHED = '__PSC_FINISHED'
const prExec = promisify(exec)

export type Review = {
  author: string
  rating: number
  commentary: string
}

export type PackageRequiredFields = {
  name: string
  version: string
  maintainer: string
  description: string
}

export type PackageOptionalFields = Partial<{
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
  rating: number
} & Partial<Pick<QueueNode, 'flag'>>

export type Autocompletion = {
  name: string
  description: string
}

export type PackagePreview = {
  source: string
  cveInfo: {
    critical: number
    high: number
    medium: number
    low: number
  }
} & PackageStatus &
  Autocompletion

export type Package = PackageRequiredFields &
  PackageOptionalFields &
  PackageStatus & { reviews: Review[]; screenshots: string[] }

type PkgRegexRequired = {
  [K in keyof PackageRequiredFields]: RegExp
}

type PkgRegexOptional = {
  [K in keyof Required<PackageOptionalFields>]: RegExp
}

const pkgRegex: {
  required: PkgRegexRequired
  optional: PkgRegexOptional
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

const waitStdoe = (stderr: Readable, stdout: Readable) =>
  Promise.race([
    new Promise((_, reject) =>
      stderr.on('data', chunk => {
        const line = chunk as string
        reject(new Error(line))
      })
    ),
    new Promise((resolve, reject) => {
      stdout.on('end', () => {
        resolve()
      })
      stderr.on('end', () => {
        reject(new Error(`Authorization error`))
      })
    })
  ])

export const perform = createAsyncThunk(
  '@apt/PERFORM ',
  async (packages: QueueNode[], { dispatch }) => {
    const prepared = packages
      .map(
        ({ flag, name }: QueueNode) =>
          `LANG=C DEBIAN_FRONTEND=noninteractive apt-get ${flag} -y ${name}; echo ${PSC_FINISHED}`
      )
      .join(';')
    try {
      const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
      if (!stdout || !stderr) throw new Error('Failed to host shell')

      // we need to subscribe to events before we do anything on the channels
      const waitPromise = waitStdoe(stderr, stdout)

      /*  for await (const chunk of stderr) {
        throw new Error(chunk as string)
      }
*/
      for await (const chunk of stdout) {
        const line = chunk as string
        console.log(line)
        if (line.match(PSC_FINISHED)) dispatch(pop())
      }

      await waitPromise
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const checkUpdates = createAsyncThunk('@apt/CHECK_UPDATES', async () => {
  try {
    const { stdout } = await prExec("LANG=C apt list --upgradable | egrep -o '^[a-z0-9.+-]+'")
    const res = stdout.split('\n').slice(0, -1)
    return res.filter((x, i) => i === res.indexOf(x))
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

export const fetchAutocompletion = createAsyncThunk<Autocompletion[], string, { state: RootState }>(
  '@apt/FETCH_AUTOCOMPLETION',
  async (packageName, { dispatch }) => {
    try {
      const { stdout } = await prExec(`LANG=C apt-cache search --names-only ${packageName}`)
      const names = stdout.split('\n')
      // additional sorting is needed because search
      // doesn't guarantee that queried package will be first in the list
      return (
        await Promise.all(
          names.slice(0, names.length - 1).map(async str => {
            const res = str.split(/ - /)
            const autocompletion: Autocompletion = {
              name: res[0],
              description: res[1]
            }
            return autocompletion
          })
        )
      ).sort((a, b) => leven(a.name, packageName) - leven(b.name, packageName))
    } catch (e) {
      dispatch(AlertActions.set(e.message))
      throw e
    }
  }
)

export const INSTALL = 'install'
export const UPGRADE = '--only-upgrade install'
export const UNINSTALL = 'purge'
export const fetchPreviews = createAsyncThunk<
  number,
  { name: string; chunk: number },
  { state: RootState }
>('@apt/FETCH_PREVIEWS', async ({ name: packageName, chunk }, { getState, dispatch }) => {
  const { queue, settings } = getState()
  dispatch(PreviewsActions.clear())
  try {
    const [{ stdout: aptResult }, { stdout: snapResult }] = await Promise.all([
      prExec(`LANG=C apt-cache search --names-only ${packageName}`),
      prExec(`LANG=C snap find ${packageName}`)
    ])

    // additional sorting is needed because search
    // doesn't guarantee that queried package will be first in the list
    const names = [
      ...aptResult
        .split('\n')
        .slice(0, -1)
        .map(str => {
          const splitted = str.split(' - ')
          return [splitted[0], splitted.slice(1).join(' - '), 'APT']
        }),
      ...snapResult
        .split('\n')
        .slice(1, -1)
        .map(str => {
          const res = /(^[a-zA-Z0-9-]+) +([a-zA-Z0-9-.~+-]+) +([a-zA-Z0-9-*.]+) +(-|[a-zA-Z0-9-]+) +(.*)/gm.exec(
            str
          )
          if (!res || !res[1] || !res[5]) return []
          return [res[1], res[5], 'SNAP']
        })
        .filter(el => el.length)
    ].sort((a, b) => leven(a[0], packageName) - leven(b[0], packageName))

    const length = names.length
    const slicedRawPreviews = names.slice((chunk - 1) * 5, chunk * 5)

    for (let i = 4; i >= slicedRawPreviews.length; i--) {
      dispatch(PreviewsActions.setPreview({ preview: null, index: i }))
    }

    slicedRawPreviews
      .map(async ([name, description, source]) => {
        const preview: PackagePreview = {
          name,
          description,
          source,
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
            const { stdout, stderr } = await prExec(`LANG=C && dpkg-query -W ${name}`)
            if (stdout.length !== 0 || stderr.length === 0) {
              preview.installed = true
              const { stdout } = await prExec(
                `LANG=C apt-cache policy ${name} | egrep "(Installed|Candidate)" | cut -c 14-`
              )
              const [current, candidate] = stdout.split('\n').slice(0, 2)
              if (current !== candidate) preview.upgradable = true
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

export const fetchPackage = createAsyncThunk<Package, string, { state: RootState }>(
  '@apt/FETCH_PACKAGE',
  async (packageName, { getState, dispatch }) => {
    const { queue, settings } = getState()
    const newPackage: Package = {
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
        !Object.keys(pkgRegex.required).every(prop => {
          const key = prop as keyof typeof pkgRegex.required
          const match = pkgRegex.required[key].exec(aptResult)
          if (match) newPackage[key] = match[1]
          else console.warn(`Missing ${key}`)
          return match
        })
      ) {
        throw new Error('Required fields are missing, skipping invalid package')
      }
      Object.keys(pkgRegex.optional).forEach(prop => {
        const key = prop as keyof typeof pkgRegex.optional
        const match = pkgRegex.optional[key].exec(aptResult)
        if (match) newPackage[key] = match[1]
        else console.warn(`Missing ${key}`)
      })

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
