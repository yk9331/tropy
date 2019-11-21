'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const { ItemTable } = __require('components/item/table')
const { noop } = __require('common/util')

describe('ItemTable', () => {
  it('has class panel-group', () => {
    const { container } = render(<ItemTable
      items={[]}
      selection={[]}
      columns={{ active: [] }}
      dt={noop}/>)
    expect(container.firstChild).to.have.class('item-table')
  })
})
