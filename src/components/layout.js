'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { on, viewport } = require('../dom')
const { ProjectContainer } = require('../components/project/container')
const { SASS: { BREAKPOINT } } = require('../constants')

const actions = require('../actions')


const {
  object, bool, func
} = require('prop-types')


class Layout extends React.Component {
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
      background: 'pink'
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
    let tandemWidth = totalWidth - this.state - offset
    let item = this.state.item + delta
    let proportion = (tandemWidth - item) / tandemWidth

    this.setState({
      item,
      proportion,
      offset
    })
  }

  render() {

    console.log('WIDTH', this.state)
    return (
      <ProjectContainer
        sidebarW={this.state.sidebar}
        projectW={this.state.project}
        panelW={this.state.panel}
        itemW={this.state.item}
        displayType={this.state.displayType}
        proportion={this.state.proportion}
        offset={this.state.offset}
        onPanelResize={this.handlePanelResize}
        onSidebarResize={this.handleSidebarResize}/>
    )
  }

  renderBackup() {
    return (
      <section ref={this.container}>
        <div
          style={this.style}>
          <div>{this.props.ui.display.proportion} {this.state.displayType}</div>
          s {this.state.sidebar} |
          P {this.state.project} |
          p {this.state.panel} |
          I {this.state.item}
        </div>
        <ProjectContainer/>
      </section>
    )
  }

  static propTypes = {
    ui: object.isRequired,
    isGiantViewEnabled: bool,
    onUiUpdate: func.isRequired,
  }
}




module.exports = {
  Layout: connect(
    state => ({
      ui: state.ui,
      isGiantViewEnabled: state.settings.giantView
    }),

    dispatch => ({

      onUiUpdate(...args) {
        dispatch(actions.ui.update(...args))
      }

    })
  )(Layout)
}
