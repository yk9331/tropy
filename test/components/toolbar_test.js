'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const { Toolbar } = __require('components/toolbar')

describe('Toolbar', () => {
  it('has class toolbar', () => {
    const { container } = render(<Toolbar/>)
    expect(container.firstChild).to.have.class('toolbar')
  })
})
