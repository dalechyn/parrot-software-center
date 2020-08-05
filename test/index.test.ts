import { existsSync } from 'fs'

test('check os to be linux', () => {
  expect(process.platform).toBe('linux')
})

test('check for apt installed', () => {
  expect(existsSync('/bin/apt') || existsSync('/usr/bin/apt')).toBe(true)
})
