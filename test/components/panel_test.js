'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const { PanelGroup } = __require('components/panel')

describe('PanelGroup', () => {
  it('has class panel-group', () => {
    const { container } = render(<PanelGroup slots={[]}/>)
    expect(container.firstChild).to.have.class('panel-group')
  })
})
