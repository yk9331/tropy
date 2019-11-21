'use strict'

const React = require('react')
const { render } = require('@testing-library/react')
const dnd = require('../../support/dnd')
const { ListTree } = __require('components/list')
const { noop } = __require('common/util')


describe.skip('Tree', () => {
  const props = {
    parent: {
      id: 0,
      parent: null,
      name: 'ROOT',
      children: [2, 1]
    },
    lists: {
      1: { id: 1, name: 'A', children: [] },
      2: { id: 2, name: 'B', children: [] }
    },
    expand: {
      0: true, 1: false, 2: false
    },
    hold: {},
    isExpanded: true,
    selection: 1,
    depth: 0,
    minDropDepth: 0,
    onContextMenu: noop,
    onDropFiles: noop,
    onDropItems: noop,
    onClick: noop,
    onEditCancel: noop,
    onExpand: noop,
    onCollapse: noop,
    onMove: noop,
    onSave: noop
  }

  it('renders all lists', () => {
    const { container } = render(<ListTree {...props}/>)
    expect(container.firstChild).to.eql(1)
  })
})
