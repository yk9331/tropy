'use strict'

const React = require('react')
const { connect } = require('react-redux')
const throttle = require('lodash.throttle')
const { SASS: { BREAKPOINT, GIANT } } = require('../../constants')
const { ProjectView } = require('./view')
const { ItemView } = require('../item')
const { viewport } = require('../../dom')
const cx = require('classnames')
const { Resizable } = require('../resizable')
const actions = require('../../actions')
const {
  arrayOf, object, bool, func, array, shape, number, string
} = require('prop-types')


class ProjectLayout extends React.Component {
  container = React.createRef()

  constructor(props) {
    super(props)
    const { sidebar, panel, display } = this.props.ui
    let proportion = display.proportion || GIANT.DEFAULT_PROPORTION
    let tandemWidth = viewport().width - sidebar.width - panel.width
    let project = Math.ceil(tandemWidth * proportion)
    let item = Math.floor(tandemWidth * (1 - proportion))

    this.state = {
      offset: panel.width,
      sidebar: sidebar.width,
      project,
      panel: panel.width,
      item,
      itemMax: 0,
      itemMin: 0,
      proportion,
      displayType: viewport().width >= BREAKPOINT.XL ? 'giant' : 'standard',
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
    if (this.state.displayType === 'giant') {
      let offset2 = this.state.sidebar + this.state.project
      return {
        transform: `translate3d(${offset2}px, 0, 0)`,
      }
    } else {
      return {
        transform: `translate3d(${this.state.offset}, 0, 0)`
      }
    }
  }

  calculateProportion = (project, item) => {
    let tandem = project + item
    return Number(((tandem - item) / tandem).toFixed(GIANT.DEC_PLACES))
  }

  isProportionOk = (p) => p >= GIANT.MIN_PROPORTION && p <= GIANT.MAX_PROPORTION

  handleResize = throttle((width) => {
    this.resize(width)
  }, 50)

  resize = (totalWidth) => {
    const { ui } = this.props
    if (this.props.isGiantViewEnabled && totalWidth >= BREAKPOINT.XL) {
      let tandemWidth = totalWidth - ui.sidebar.width - ui.panel.width
      let project = Math.ceil(tandemWidth * this.state.proportion)
      let item = Math.floor(tandemWidth * (1 - this.state.proportion))
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

  handleSidebarOnResize = ({ value }) => {
    let delta = this.state.sidebar - value
    let project = this.state.project + delta
    let proportion = this.calculateProportion(project, this.state.item)
    if (this.isProportionOk(proportion)) {
      this.setState({
        sidebar: value,
        project,
        proportion
      })
    }
  }

  handleProjectOnResize = ({ value }) => {
    let orig = this.state.panel + this.state.item
    let delta = orig - value
    let project = this.state.project + delta
    let item = this.state.item - delta
    let proportion = this.calculateProportion(project, item)
    if (this.isProportionOk(proportion)) {
      this.setState({
        project,
        item,
        proportion
      })
    }
  }

  handlePanelResize = ({ value }) => {
    let delta = this.state.offset - value
    let item = this.state.item + delta
    let proportion = this.calculateProportion(this.state.project, item)
    if (this.isProportionOk(proportion)) {
      this.setState({
        item,
        offset: value,
        panel: value,
        proportion
      })
    }
  }

  handleSidebarDragStop = () => {
    this.props.onUiUpdate({
      sidebar: { width: this.state.sidebar },
      display: { proportion: Number(this.state.proportion) }
    })
  }

  handleProjectDragStop = () => {
    this.props.onUiUpdate({
      display: { proportion: Number(this.state.proportion) }
    })
  }

  handlePanelDragStop = () => {
    this.props.onUiUpdate({
      display: { proportion: Number(this.state.proportion) }
    })
  }

  render() {
    const  {
      ui,
      ...props
    } = this.props

    return (
      <div className={cx(this.classes)} ref={this.container}>
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
          sidebarWidth={this.state.sidebar}
          zoom={ui.zoom}
          display={ui.display}
          displayType={this.state.displayType}
          onSidebarResize={this.handleSidebarOnResize}
          onSidebarDragStop={this.handleSidebarDragStop}
          onMetadataSave={this.props.onMetadataSave}/>

        <Resizable
          edge="left"
          value={this.state.panel + this.state.item}
          onResize={this.handleProjectOnResize}
          onDragStop={this.handleProjectDragStop}
          style={this.style}>
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
            mode={this.props.mode}
            display={ui.display}
            displayType={this.state.displayType}
            isModeChanging={this.props.isModeChanging}
            isTrashSelected={!!this.props.nav.trash}
            isProjectClosing={this.props.project.closing}
            onPanelResize={this.handlePanelResize}
            onPanelDragStop={this.handlePanelDragStop}
            onMetadataSave={this.props.onMetadataSave}/>
        </Resizable>
      </div>
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
