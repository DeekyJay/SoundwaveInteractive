import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as boardActions } from '../redux/modules/Board'
import { actions as soundActions } from '../redux/modules/Sounds'
import { actions as profileActions } from '../redux/modules/Profiles'
import ReactGridLayout from 'react-grid-layout'
import ReactToolTip from 'react-tooltip'
import DevLabUtil from '../redux/utils/DevLabUtil'
import _ from 'lodash'
import Ink from '../components/Ink/src'

const largeGrid = DevLabUtil.makeGrid(16, 4)

export class BoardEditor extends React.Component {

  static propTypes = {
    board: PropTypes.object.isRequired,
    boardActions: PropTypes.object.isRequired,
    soundActions: PropTypes.object.isRequired,
    profileActions: PropTypes.object.isRequired,
    profileId: PropTypes.string.isRequired,
    profiles: PropTypes.array.isRequired,
    tutMode: PropTypes.bool.isRequired,
    tutStep: PropTypes.number
  }

  createGame = () => {
    this.props.boardActions.createGame()
  }

  showBoard = (board) => {
    this.props.boardActions.showBoard(board)
  }

  addButtonToBoard = () => {
    this.props.boardActions.addButtonToBoard()
  }

  onDragStop = (grid) => {
    this.props.boardActions.updateGrid(grid)
  }

  onResizeStop = (grid) => {
    this.props.boardActions.updateGrid(grid)
  }

  toggleLock = () => {
    this.props.profileActions.toggleLock()
  }

  getGame = () => {
    this.props.boardActions.getOwnedGames()
  }

  editSound = (index) => {
    this.props.soundActions.setupEdit(index)
  }

  isDisabled = (step) => {
    const { tutMode, tutStep } = this.props
    if (!tutMode) return null
    return (
      <span className={tutStep !== step ? 'disabled' : ''}></span>
    )
  }

  render () {
    const {
      profiles,
      profileId,
      board: {
        isGameCreating,
        hasSoundBoardGame
      }
    } = this.props
    const profile = _.find(profiles, (prof) => { return prof.id === profileId })
    return (
      <div className='board-editor-container'>
        <div className='board-editor-title'>Interactive Board{profile ? ' | ' + profile.name : null}</div>
        <div className='board-editor'>
        {hasSoundBoardGame
          ? this.renderBoard()
          : <div className='no-game'>
            {isGameCreating
              ? <div className='loading'></div>
              : <span>
                Looks like you don't have a soundboard game in the Beam Dev Labs.
                <div className='add-game-container'>
                  <span className='add-game' onClick={this.createGame}>Create Soundboard<Ink /></span>
                </div>
              </span>}
          </div>
        }
        </div>
        {this.isDisabled(4)}
      </div>
    )
  }

  isProfileLocked = () => {
    const { profileId, profiles } = this.props
    return _.find(profiles, p => p.id === profileId && p.locked)
  }

  renderBoard = () => {
    const {
      profiles,
      profileId,
      board: {
        large_grid
      }
    } = this.props
    return (
      <div className='board'>
        {profileId
          ? <div className='board-editor-wrapper'>
            <div className='board-background-grid'>
              <div className='board-wrapper'>
                {this.renderBackgroundGridDetails('large', 16, 30, 600, [4, 4], 'grid-box')}
                {large_grid && large_grid.length
                  ? this.renderProfileGrid(large_grid)
                  : null}
              </div>
            </div>
            {this.isProfileLocked() ? <div className='board-locked'><span className='sicon-lock' /></div> : null}
            <div className='board-actions'>
              <div className='board-action lock' data-tip='Unlock/Lock Edit Mode' onClick={this.toggleLock}>
                <div className={!this.isProfileLocked() ? 'sicon-lock' : 'sicon-unlock'}></div>
                <Ink />
              </div>
              <div className='board-action fetch' data-tip='Load Changes from Beam' onClick={this.getGame}>
                <div className='sicon-cloud-fetch'></div>
                <Ink />
              </div>
            </div>
          </div>
          : <div className='board-no-profile'>
            <div className='board-select-profile'>
              {profiles && profiles.length ? 'Please Select A Profile' : 'Please Create A Profile'}
            </div>
          </div>}
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
      </div>
    )
  }

  renderProfileGrid = (large_grid) => {
    return (
      <ReactGridLayout
        layout={large_grid}
        className='profile-grid large'
        cols={16}
        rowHeight={30}
        maxRows={4}
        width={600}
        margin={[4, 4]}
        verticalCompact>
        {
          large_grid.map((button) => {
            const clickSound = this.editSound.bind(this, button.i)
            return (
              <div key={button.i} className='grid-button' onClick={clickSound} >
                <div className='button-number'>#{button.i}</div>
                <div className='button-name'>{button.name}</div>
                <span className={`tactile tactile|${button.i}`}></span>
                <Ink className={`tactile tactile|${button.i}`} />
              </div>
            )
          })
        }
      </ReactGridLayout>
    )
  }

  renderBackgroundGrid = () => {
    return (
      <div className='background-grid-container'>
        <div className='background-grid-row'>
          {this.renderColumns()}
        </div>
        <div className='background-grid-row'>
          {this.renderColumns()}
        </div>
        <div className='background-grid-row'>
          {this.renderColumns()}
        </div>
        <div className='background-grid-row'>
          {this.renderColumns()}
        </div>
      </div>
    )
  }

  renderColumns = () => {
    let arr = []
    for (let i = 0; i < 16; i++) {
      arr.push(<span className='background-grid-cube' />)
    }
    return arr
  }

  renderBackgroundGridDetails = (grid, cols, rowHeight, width, margin, box_class) => {
    return (
      <ReactGridLayout
        layout={largeGrid}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        margin={margin}
        verticalCompact={false} >
        {largeGrid.map((item) => {
          return (
            <div className={box_class} key={item.i}></div>
          )
        })}
      </ReactGridLayout>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  board: state.board,
  profileId: state.profiles.profileId,
  profiles: state.profiles.profiles,
  tutMode: state.app.tutMode,
  tutStep: state.app.tutStep
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  boardActions: bindActionCreators(boardActions, dispatch),
  soundActions: bindActionCreators(soundActions, dispatch),
  profileActions: bindActionCreators(profileActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardEditor)
