import PackagePreview from '../../components/PackagePreview'
import React from 'react'

const pkgRegex = {
  required: {
    package: /^Package: ([a-z0-9.+-]+)/gm,
    version: /^Version: ((?<epoch>[0-9]{1,4}:)?(?<upstream>[A-Za-z0-9~.]+)(?:-(?<debian>[A-Za-z0-9~.]+))?)/gm,
    // eslint-disable-next-line no-control-regex
    maintainer: /^Maintainer: ((?<name>(?:[\S ]+\S+)) <(?<email>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)]))>)/gm,
    description: /^Description-(?:[a-z]{2}): (.*(?:\n \S.*)*)/gm
  },
  optional: {
    section: /^Section: ([a-z]+)/gm,
    priority: /^Priority: (\S+)/gm,
    essential: /^Essential: (yes|no)/gm,
    architecture: /^Architecture: (.*)/gm,
    origin: /^Origin: ([a-z0-9.+-]+)/gm,
    bugs: /^Bugs: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gm,
    homepage: /^Homepage: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gm,
    tag: /^Tag: ((?: ?[A-Za-z-+:]*(?:,(?:[ \n])?)?)+)/gm,
    source: /^Source: ([a-zA-Z0-9-+.]+)/gm,
    depends: /^Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    preDepends: /^Pre-Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    recommends: /^Recommends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    suggests: /^Suggests: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/gm,
    breaks: /^Breaks: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    conflicts: /^Conflicts: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    replaces: /^Replaces: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    provides: /^Provides: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/gm,
    installedSize: /^Installed-Size: (.*)/gm,
    downloadSize: /^Download-Size: (.*)/gm,
    aptManualInstalled: /^APT-Manual-Installed: (.*)/gm,
    aptSources: /^APT-Sources: (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)(?: (?:\S+ ?)+))/gm
  }
}

const processDescription = str => {
  const cleared = str.replace(/^ \./gm, '\n').replace(/^ /gm, '')
  const upperCased = cleared.charAt(0).toUpperCase() + cleared.slice(1)
  const firstSentenceDotted = upperCased.replace(/\n/, '.\n')
  const lines = firstSentenceDotted.split('\n')
  lines[0] = lines[0] + '\n'
  return lines.join('')
}

export const formPackagePreviews = async searchQueryResults => {
  const parsedPackages = []
  for (let i = 0; i < searchQueryResults.length; i++) {
    const el = {}
    // Filling required fields
    if (
      !Object.keys(pkgRegex.required).every(key => {
        const match = pkgRegex.required[key].exec(searchQueryResults[i])
        if (match) el[key] = match[1]
        return match
      })
    ) {
      console.warn(
        `required fields are invalid, skipping invalid package`,
        JSON.stringify(searchQueryResults[i])
      )
      continue
    }

    // Filling optional fields
    Object.keys(pkgRegex.required).forEach(key => {
      const match = pkgRegex.required[key].exec(searchQueryResults[i])
      if (match) el[key] = match[1]
      return match
    })

    parsedPackages.push(el)
  }

  const imageUrl = new URL('assets/packages/', await window.getUrl()).toString()

  return parsedPackages.map(pkg => {
    return (
      <PackagePreview
        name={pkg.package}
        description={processDescription(pkg.description)}
        version={pkg.version}
        maintainer={pkg.maintainer}
        key={pkg.package}
        imageUrl={`${imageUrl}${pkg.package}.png`}
      />
    )
  })
}
