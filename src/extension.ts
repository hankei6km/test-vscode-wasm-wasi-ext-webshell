import { commands, ExtensionContext, Uri, window, workspace } from 'vscode'
import { Wasm } from '@vscode/wasm-wasi'

export async function activate(context: ExtensionContext) {
  const wasm: Wasm = await Wasm.load()

  commands.registerCommand('wasm-wasi-hello.run', async () => {
    const pty = wasm.createPseudoterminal()
    const terminal = window.createTerminal({
      name: 'hello',
      pty,
      isTransient: true
    })
    terminal.show(true)

    try {
      const filename = Uri.joinPath(
        context.extensionUri,
        'wasm',
        'bin',
        'hello.wasm'
      )
      const bits = await workspace.fs.readFile(filename)
      const module = await WebAssembly.compile(bits)
      const process = await wasm.createProcess('hello', module, {
        stdio: pty.stdio
      })
      const result = await process.run()
      if (result === 0) {
        await window.showInformationMessage(`Process demo ended successfully`)
      } else {
        await window.showErrorMessage(
          `Process demo ended with error: ${result}`
        )
      }
    } catch (err: any) {
      void pty.write(`Launching demo failed: ${err.toString()}`)
    }
  })
}

export function deactivate() {}
