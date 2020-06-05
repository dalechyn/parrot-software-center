import rootReducer from './root.reducer'
import { PromiseWithChild } from 'child_process'

declare global {
  export type RootState = ReturnType<typeof rootReducer>
}

declare module 'sudo-prompt' {
  // NOTE: This namespace provides design-time support for util.promisify. Exported members do not exist at runtime.
  namespace exec {
    function __promisify__(command: string): PromiseWithChild<{ stdout: string; stderr: string }>
    function __promisify__<TBuffer = string | Buffer>(
      command: string,
      options:
        | ((error?: Error, stdout?: TBuffer, stderr?: TBuffer) => void)
        | { name?: string; icns?: string; env?: { [key: string]: string } }
    ): PromiseWithChild<{ stdout: TBuffer; stderr: TBuffer }>
  }
}
