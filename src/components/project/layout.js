'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { on, viewport } = require('../../dom')
const { SASS: { BREAKPOINT } } = require('../../constants')
const { ProjectView } = require('./view')
const { ItemView } = require('../item')

const actions = require('../../actions')


const {
  object, bool, func, string, number, array
} = require('prop-types')


class ProjectLayout extends React.Component {
  container = React.createRef()

  constructor(props) {
    super(props)

    let proportion = props.ui.display.proportion || 0.5
    let tandemWidth = viewport().width - this.props.ui.sidebar.width - this.props.ui.panel.width
    let project = tandemWidth * proportion
    let item = tandemWidth * (1 - proportion)

    this.state = {
      offset: this.props.ui.panel.width,
      displayType: viewport().width > BREAKPOINT.XL ? 'giant' : 'standard',
      sidebar: this.props.ui.sidebar.width,
      project,
      panel: this.props.ui.panel.width,
      item,
      proportion
    }
  }


  componentDidMount() {
    on(window, 'resize', this.handleWindowResize)
  }

  componentWillUnmount() {
  }

  get classes() {
    return ['layout', {}]
  }

  get style() {
    return {
      position: 'fixed',
      top: '20px',
      right: '0px',
      width: '300px',
      background: 'pink',
      zIndex: 1100
    }
  }

  handleWindowResize = () => {
    let totalWidth = viewport().width
    console.log('handleWindowResize')

    if (this.props.isGiantViewEnabled && totalWidth > BREAKPOINT.XL) {
      let tandemWidth = totalWidth - this.props.ui.sidebar.width - this.props.ui.panel.width
      let project = tandemWidth * this.state.proportion
      let item = tandemWidth * (1 - this.state.proportion)
      this.setState({
        displayType: 'giant',
        project,
        item
      })
    } else {
      console.log('standard')
      this.setState({
        displayType: 'standard'
      })
    }

  }

  handleSidebarResize = (width) => {
    console.log('sidebar resize on project cont', width)
    let totalWidth = viewport().width
    let project = totalWidth - width - this.state.item - this.props.ui.panel.width
    let tandemWidth = totalWidth - width - this.props.ui.panel.width
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

  handlePanelResize = (offset) => {
    let delta = this.state.offset - offset
    let totalWidth = viewport().width
    let tandemWidth = totalWidth - this.state.sidebar - offset
    let item = this.state.item + delta
    let proportion = (tandemWidth - item) / tandemWidth

    this.setState({
      item,
      proportion,
      offset,
      panel: offset
    })
  }

  render() {
    const  {
      ui,
      ...props
    } = this.props

    var divStyle = { display: 'initial' }

    return (
      <div style={divStyle}>
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
          offset2={ui.sidebar.width + this.state.project}
          mode={this.props.mode}
          display={ui.display}
          displayType={this.state.displayType}
          isModeChanging={this.props.isModeChanging}
          isTrashSelected={!!this.props.nav.trash}
          isProjectClosing={this.props.project.closing}
          onPanelResize={this.handlePanelResize}
          onMetadataSave={this.props.onMetadataSave}/>

      </div>
    )
  }

  renderDebug() {
    return (
      <section ref={this.container}>
        <div
          style={this.style}>
          <div>{this.props.ui.display.proportion} {this.state.displayType}</div>
          s {this.state.sidebar} |
          P {this.state.project} |
          p {this.state.panel} |
          I {this.state.item}<br/>
          O {this.state.offset}
        </div>
      </section>
    )
  }

  static propTypes = {
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
