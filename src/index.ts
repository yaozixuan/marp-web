import IncrementalDOM from 'incremental-dom'
import { patch } from './marp/incremental-dom-proxy'
import MarpManager from './marp/manager'

export default function index() {
  const marpMg = new MarpManager()
  const editor = <HTMLTextAreaElement>document.getElementById('editor')
  const preview = <HTMLDivElement>document.getElementById('preview')
  const previewCSS = <HTMLStyleElement>document.getElementById('preview-css')

  const render = markdown => marpMg.render(markdown || '')

  marpMg.onRendered = rendered => {
    const { html, css } = rendered

    const renderDOM = () =>
      window.requestAnimationFrame(() => {
        if (previewCSS.textContent !== css) previewCSS.textContent = css
        patch(IncrementalDOM, preview, html)
      })

    if ((<any>window).requestIdleCallback) {
      ;(<any>window).requestIdleCallback(renderDOM)
    } else {
      renderDOM()
    }
  }

  editor.addEventListener('input', () => render(editor.value))
  render(editor.value)
}
