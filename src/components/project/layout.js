'use strict'

const React = require('react')
const { connect } = require('react-redux')
const throttle = require('lodash.throttle')
const { SASS: { BREAKPOINT, GIANT } } = require('../../constants')
const { restrict } = require('../../common/util')
const { ProjectView } = require('./view')
const { ItemView } = require('../item')
const { bounds, viewport } = require('../../dom')
const cx = require('classnames')


const actions = require('../../actions')


const {
  arrayOf, object, bool, func, array, shape, number, string
} = require('prop-types')


class ProjectLayout extends React.Component {
  container = React.createRef()

  constructor(props) {
    super(props)
    let proportion = props.ui.display.proportion || 0.5
    let tandemWidth = viewport().width - this.props.ui.sidebar.width - this.props.ui.panel.width
    let project = tandemWidth * proportion

    this.state = {
      offset: this.props.ui.panel.width,
      sidebar: this.props.ui.sidebar.width,
      project,
      panel: this.props.ui.panel.width,
      proportion,
      displayType: viewport().width > BREAKPOINT.XL ? 'giant' : 'standard',
    }
  }


  componentDidMount() {
    this.ro = new ResizeObserver(([e]) => {
      this.handleResize(e.contentRect.width)
    })
    this.ro.observe(this.container.current)
  }



  componentWillUnmount() {
    this.ro.unobserve(this.container.current)
    this.ro.disconnect()
    this.ro = null
  }

  get classes() {
    return ['layout',
      { 'layout-giant': this.state.displayType === 'giant' },
      { 'layout-standard': this.state.displayType === 'standard' }
    ]
  }

  get style() {
    return {
      position: 'fixed',
      bottom: '20px',
      right: '0px',
      width: '100%',
      background: 'pink',
      zIndex: 1100
    }
  }

  handleResize = throttle((width) => {
    this.resize(width)
  }, 50)

  resize = (totalWidth) => {
    if (this.props.isGiantViewEnabled && totalWidth > BREAKPOINT.XL) {
      let tandemWidth = totalWidth - this.props.ui.sidebar.width - this.props.ui.panel.width
      let project = tandemWidth * this.state.proportion
      let item = tandemWidth * (1 - this.state.proportion)
      this.setState({
        displayType: 'giant',
        project,
        item,
        totalWidth
      })
    } else {
      this.setState({
        displayType: 'standard',
        totalWidth
      })
    }

  }

  handleSidebarResize = (width) => {
    let project = this.state.totalWidth - width - this.state.item - this.props.ui.panel.width
    let tandemWidth = this.state.totalWidth  - width - this.props.ui.panel.width
    let proportion = project  / tandemWidth

    this.setState({
      project: Math.round(project),
      proportion,
      sidebar: Math.round(width)
    })
    this.props.onUiUpdate({
      sidebar: { width: Math.round(width) },
      display: { proportion: proportion },
    })

  }

  handlePanelResize = (newWidth) => {
    let delta = this.state.offset - newWidth
    let item = this.state.item + delta

    this.setState({
      item,
      offset: newWidth,
      panel: newWidth
    })
  }

  handlePanelDragStart = (ev, active) => {
    this.panelLimits = {
      min: active.props.min,
      max: active.props.max }
  }

  handleProjectDragStart = (ev, active) => {
    this.projectLimits = {
      min: active.props.min
    }
  }

  handlePanelDrag = ({ pageX }, active) => {
    console.log ('active DRAG', active)
    const { min, max } = this.panelLimits
    let delta = pageX - bounds(active.container.current).right
    let newWidth = this.state.panel + delta

    if (this.state.displayType === 'giant') {
      this.handlePanelResize(restrict(newWidth, min, max))
    } else {
      switch (this.props.mode) {
        case 'item':
          delta = pageX - bounds(active.container.current).right
          newWidth = this.state.panel + delta
          this.handlePanelResize(restrict(newWidth, min, max))
          break
        case 'project':
          delta = pageX - bounds(active.container.current).left
          newWidth = this.state.panel - delta
          this.handlePanelResize(restrict(newWidth, min, max))
      }
    }
  }

  handleProjectDrag = ({ pageX }, active) => {
    const { min } = this.projectLimits
    let delta = pageX - bounds(active.container.current).right
    let newWidth = restrict(this.state.project + delta, min )
    let project = newWidth
    let item = this.state.item + (this.state.project - newWidth)

    if (item >= GIANT.MIN_ITEM) {
      this.setState({
        project,
        item
      })
    } else {
      this.setState({
        project: (this.state.project + this.state.item) - GIANT.MIN_ITEM,
        item: GIANT.MIN_ITEM
      })
    }

  }

  get proportion() {
    let tandemWidth = this.state.totalWidth  - this.state.sidebar - this.state.panel
    return (tandemWidth - this.state.item) / tandemWidth
  }

  handlePanelDragStop = () => {
    this.panelLimits = null
    this.setState({ proportion: this.proportion })
  }

  handleProjectDragStop = () => { this.projectLimits = null }

  render() {
    const  {
      ui,
      ...props
    } = this.props

    var divStyle = { display: 'initial' }

    return (
      <div className={cx(this.classes)} style={divStyle}>
        {this.renderDebug()}
        <ProjectView {...props}
          width={this.state.project}
          nav={this.props.nav}
          items={this.props.items}
          data={this.props.data}
          isActive={this.props.isActive}
          isEmpty={this.props.isEmpty}
          columns={this.props.columns}
          offset={this.state.offset}
          photos={this.props.photos}
          templates={this.props.templates}
          zoom={ui.zoom}
          display={ui.display}
          displayType={this.state.displayType}
          onSidebarResize={this.handleSidebarResize}
          onProjectDragStart={this.handleProjectDragStart}
          onProjectDrag={this.handleProjectDrag}
          onProjectDragStop={this.handleProjectDragStop}
          onMetadataSave={this.props.onMetadataSave}/>

        <ItemView {...props}
          width={this.state.item}
          items={this.props.selection}
          data={this.props.data}
          activeSelection={this.props.nav.selection}
          note={this.props.note}
          notes={this.props.notes}
          photo={this.props.photo}
          photos={this.props.visiblePhotos}
          panel={ui.panel}
          offset={this.state.offset}
          offset2={this.state.sidebar + this.state.project}
          mode={this.props.mode}
          display={ui.display}
          displayType={this.state.displayType}
          isModeChanging={this.props.isModeChanging}
          isTrashSelected={!!this.props.nav.trash}
          isProjectClosing={this.props.project.closing}
          onPanelDragStart={this.handlePanelDragStart}
          onPanelDrag={this.handlePanelDrag}
          onPanelDragStop={this.handlePanelDragStop}
          onMetadataSave={this.props.onMetadataSave}/>

      </div>
    )
  }

  renderDebug() {
    return (
      <section ref={this.container}>
        <div
          style={this.style}>
          <span style={{ width: this.state.sidebar + 'px', display: 'inline-block', backgroundColor: 'orange' }}> {this.state.sidebar}</span>
          <span style={{ width: this.state.project + 'px', display: 'inline-block', backgroundColor: 'aqua' }}> {this.state.project}</span>
          <span style={{ width: this.state.panel + 'px', display: 'inline-block', backgroundColor: 'lightgreen' }}> {this.state.panel}</span>
          <span style={{ width: this.state.item + 'px', display: 'inline-block', backgroundColor: 'gray' }}> {this.state.item}</span>
          <div> {this.state.proportion} {this.props.ui.display.proportion} {this.state.displayType} {this.state.offset} {this.props.ui.sidebar.width + this.state.project}</div>
        </div>
      </section>
    )
  }

  static propTypes = {
    data: object.isRequired,
    canDrop: bool,
    edit: object.isRequired,
    isActive: bool,
    isEmpty: bool.isRequired,
    isOver: bool,
    items: array.isRequired,
    keymap: object.isRequired,
    nav: object.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,
    dt: func.isRequired,
    onItemCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,


    project: object.isRequired,
    selection: arrayOf(
      shape({ id: number.isRequired })
    ),
    note: shape({ id: number.isRequired }),
    notes: arrayOf(
      shape({ id: number.isRequired })
    ),
    photo: object,
    visiblePhotos: arrayOf(
      shape({ id: number.isRequired })
    ),
    columns: object.isRequired,
    templates: object.isRequired,
    isModeChanging: bool.isRequired,
    mode: string.isRequired,

    ui: object.isRequired,
    isGiantViewEnabled: bool,
    onUiUpdate: func.isRequired,
    onMetadataSave: func.isRequired
  }
}




module.exports = {
  ProjectLayout: connect(
    state => ({
      ui: state.ui,
      isGiantViewEnabled: state.settings.giantView
    }),

    dispatch => ({

      onUiUpdate(...args) {
        dispatch(actions.ui.update(...args))
      }

    })
  )(ProjectLayout)
}
