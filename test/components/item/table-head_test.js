'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const { ItemTableHead } = __require('components/item/table-head')

describe('ItemTableHead', () => {
  it('has class table-head', () => {
    const { container } = render(<ItemTableHead columns={[]}/>)
    expect(container.firstChild).to.have.class('table-head')
  })

  it('renders head columns', () => {
    const columns = [
      { id: 'x', type: 'string', name: 'dummy'  },
      { id: 'y', type: 'number', name: 'foo'  }
    ]
    const colwidth = []
    const sort = {
      column: 'y', asc: true, type: 'property'
    }

    const { getByText, container } = render(<ItemTableHead
      colwidth={colwidth}
      columns={columns}
      sort={sort}/>)
    expect(container.firstChild).to.contain('.metadata-head').and.length(2)
    expect(getByText('Dummy')).to.have.class('label')
    expect(getByText('Foo')).to.have.class('label')
  })
})
