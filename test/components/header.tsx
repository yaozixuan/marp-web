import { h } from 'preact'
import { deep, FindWrapper } from 'preact-render-spy'
import { HeaderButton } from '../../src/components/button'
import { Header } from '../../src/components/header'
import * as utils from '../../src/components/utils'

jest.useFakeTimers()

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation())
afterEach(() => jest.restoreAllMocks())

describe('<Header />', () => {
  const header = (props: any = {}) => deep(<Header {...props} />)

  it('renders <header> element', () =>
    expect(header().find('header')).toHaveLength(1))

  describe('App button', () => {
    const appBtn = (component: FindWrapper<any, any> = header()) =>
      component.find(<HeaderButton class="appButton" />)

    const clickEventSpy = (props = {}) => ({
      target: { focus: jest.fn() },
      ...props,
    })

    const click = (btn: FindWrapper<any, any>, e = clickEventSpy()) =>
      btn.simulate('click', e)

    it('renders a header button with appButton class', () =>
      expect(appBtn()).toHaveLength(1))

    context('when clicked', () => {
      it('toggles main menu and focuses to the clicked button', () => {
        const component = header()
        const findMenu = () => component.find(<ul role="menu" />)
        const e = clickEventSpy()

        expect(findMenu()).toHaveLength(0)

        // Open
        click(appBtn(component), e)
        expect(findMenu()).toHaveLength(1)
        expect(e.target.focus).toBeCalledTimes(1)

        // Close
        click(appBtn(component), e)
        expect(findMenu()).toHaveLength(0)
        expect(e.target.focus).toBeCalledTimes(2)
      })
    })

    describe('Menu items', () => {
      const component = (props = {}): FindWrapper<any, any> => {
        const ret = header(props)
        click(appBtn(ret))

        return ret
      }

      const findMenuItem = (
        from: FindWrapper<any, any>,
        condition: (element: FindWrapper<any, any>) => any
      ): FindWrapper<any, any> =>
        from
          .find('DropdownItem')
          .map(e => e)
          .find(condition)

      describe('New', () => {
        it('triggers passed newCommand action with delay', () => {
          const newCommand = jest.fn()
          const newMenu = findMenuItem(
            component({ newCommand }),
            elm => elm.text() === 'New'
          )
          expect(newMenu).toHaveLength(1)

          newMenu.simulate('click')

          jest.runOnlyPendingTimers()
          expect(newCommand).toBeCalled()
        })
      })

      describe('Open', () => {
        it('triggers passed openCommand action with delay', () => {
          const openCommand = jest.fn()
          const openMenu = findMenuItem(
            component({ openCommand }),
            elm => elm.text() === 'Open...'
          )
          expect(openMenu).toHaveLength(1)

          openMenu.simulate('click')

          jest.runOnlyPendingTimers()
          expect(openCommand).toBeCalled()
        })
      })

      describe('Print', () => {
        it('triggers window.print() with delay', () => {
          const print = findMenuItem(
            component(),
            elm => elm.text() === 'Print...'
          )
          expect(print).toHaveLength(1)

          const printSpy = jest.spyOn(window, 'print').mockImplementation()
          print.simulate('click')

          jest.runOnlyPendingTimers()
          expect(printSpy).toBeCalled()
        })

        context('when it has rendered in Chrome', () => {
          beforeEach(() =>
            jest.spyOn(utils, 'isChrome').mockImplementation(() => true)
          )

          it('has a <DropdownItem> for print and export to PDF', () => {
            const print = findMenuItem(
              component(),
              elm => elm.text() === 'Print / Export to PDF...'
            )
            expect(print).toHaveLength(1)
          })
        })
      })
    })
  })
})
