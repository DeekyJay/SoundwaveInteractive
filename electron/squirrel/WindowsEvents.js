// Handles squirrel events for Windows executable
import path from 'path'
import { spawn } from 'child_process'

const run = function (args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe')
  spawn(updateExe, args, {
    detached: true
  }).on('close', done)
}

export const handleStartup = function (app) {
  if (process.platform !== 'win32') {
    return false
  }

  const squirrelCommand = process.argv[1]
  const target = path.basename(process.execPath)
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':

      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done
      run(['--createShortcut=' + target + ''], app.quit)
      return true
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      app.quit()
      return true
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit()
      return true
  }
}
