/* eslint-disable-next-line no-restricted-imports -- this file should be the only one importing from shellac */
import originalShellac from 'shellac';

// Note: shellac by default does not pass the current process.env to the shell it
//       creates, when dealing with package managers in some cases having access to
//       the global env variables can be necessary, that's why we override shellac
//       here to always include them
export const shellac = originalShellac.env({ ...process.env });
