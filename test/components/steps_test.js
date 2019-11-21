'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const { Steps, Step } = __require('components/steps')

describe('Steps', () => {
  it('has class steps', () => {
    const { container } = render(<Steps/>)
    expect(container.firstChild).to.have.class('steps')
  })
})

describe('Step', () => {
  it('has class step', () => {
    const { container } = render(<Step/>)
    expect(container.firstChild).to.have.class('step')
  })
})
