import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as interactiveActions } from '../redux/modules/Interactive'

export class Cooldown extends React.Component {

  static propTypes = {
    interactiveActions: PropTypes.object.isRequired,
    staticCooldown: PropTypes.number.isRequired
  }

  updateField = (e) => {
    this.props.interactiveActions.updateStaticCooldown(e.target.value)
  }

  render () {
    const { staticCooldown } = this.props
    return (
      <div className='cooldown-container'>
        <div className='cooldown-title'>Cooldown</div>
        <div className='cooldown-wrapper'>
          <div className='form-group'>
            <label htmlFor='staticCooldown'>Static Cooldown Time (ms)</label>
            <input
              type='number'
              name='staticCooldown'
              value={staticCooldown}
              onChange={this.updateField} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  staticCooldown: state.interactive.storage.staticCooldown
})
const mapDispatchToProps = (dispatch) => ({
  interactiveActions: bindActionCreators(interactiveActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Cooldown)
