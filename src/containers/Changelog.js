import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import InfoGroup from '../components/InfoComponents/InfoGroup'
import InfoBullet from '../components/InfoComponents/InfoBullet'

export class Changelog extends React.Component {

  static propTypes = {
  }

  render () {
    return (
      <div className='info-container'>
        <div className='info-title'>Changelog</div>
        <div className='info-wrapper'>
          <InfoGroup title='Some New Stuff' className='new'
            text={'Here are some new features we\'ve recently added.'}>
            <InfoBullet text='Kill Playing Sounds - Accidentally let users trigger some really long and annoying sounds? You can now stop all the sounds!' />
          </InfoGroup>
          <InfoGroup title='Some Changed Stuff' className='change'
            text={'Here are some changes we\'ve made since the last release.'}>
            <InfoBullet text='Various tweaks to the audio library to handle audio playback issues.' />
            <InfoBullet text='Icon sizing issues on Windows.' />
            <InfoBullet text='Handle reconnect on timeout errors.' />
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
)(Changelog)
