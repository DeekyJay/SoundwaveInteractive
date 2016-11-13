import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import InfoGroup from '../components/InfoComponents/InfoGroup'
import InfoBullet from '../components/InfoComponents/InfoBullet'
import { shell } from 'electron'
const version = require('../../package.json').version

export class Info extends React.Component {

  static propTypes = {
  }

  goToLink = (e) => {
    console.log(e.target.name)
    switch (e.target.name) {
      case 'wiki':
        shell.openExternal('https://github.com/DeekyJay/BeamSoundlyInteractive/wiki')
        break
      case 'forums':
        shell.openExternal('https://forums.beam.pro/')
        break
    }
  }

  render () {
    return (
      <div className='info-container'>
        <div className='info-title'>Info</div>
        <div className='info-wrapper'>
          <InfoGroup title='The App' className='app'
            text='We might ask you for this info sometime. This is where to find it!'>
            <InfoBullet text={'Version: v' + version} />
          </InfoGroup>
          <InfoGroup title='Knowledgebase' className='know'
            text={'Looking for useful information? Check out these useful links'}>
            <li><a name='wiki' onClick={this.goToLink}>Wiki</a></li>
            <li><a name='forums' onClick={this.goToLink}>Beam Forums</a></li>
          </InfoGroup>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}
const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Info)
