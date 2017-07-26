'use strict'

const React = require('react')
const { PureComponent } = React
const { StaticField } = require('../metadata/field')
const { func, object } = require('prop-types')
const { basename } = require('path')
const { bytes, datetime, number } = require('../../format')
const { Map, Marker, TileLayer } = require('react-leaflet')

class PhotoInfo extends PureComponent {
  get file() {
    return basename(this.props.photo.path)
  }

  get size() {
    const { width, height, size } = this.props.photo
    return `${number(width)}×${number(height)}, ${bytes(size)}`
  }

  handleFileClick = () => {
    this.props.onOpenInFolder(this.props.photo.path)
  }

  render() {
    const position = [51.505, -0.09]
    return (
      <div className="photo-info">
        <ol className="metadata-fields">
          <StaticField
            label="photo.file"
            value={this.file}
            onClick={this.handleFileClick}/>
          <StaticField
            label="photo.size"
            value={this.size}/>
          <StaticField
            label="photo.created"
            value={datetime(this.props.photo.created)}/>
          <StaticField
            label="item.modified"
            value={datetime(this.props.photo.modified)}/>
        </ol>
        <Map center={position} zoom={18}>
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"/>
          <Marker position={position}/>
        </Map>
      </div>
    )
  }

  static propTypes = {
    photo: object.isRequired,
    onOpenInFolder: func.isRequired
  }
}

module.exports = {
  PhotoInfo
}
