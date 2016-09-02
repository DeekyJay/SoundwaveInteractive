import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as boardActions } from '../redux/modules/Board'
import ReactGridLayout from 'react-grid-layout'
import ReactToolTip from 'react-tooltip'
import DevLabUtil from '../redux/utils/DevLabUtil'
import _ from 'lodash'

const largeGrid = DevLabUtil.makeGrid(16, 4)
const mediumGrid = DevLabUtil.makeGrid(9, 5)
const smallGrid = DevLabUtil.makeGrid(6, 8)

export class BoardEditor extends React.Component {

  static propTypes = {
    hasSoundBoardGame: PropTypes.bool.isRequired,
    board: PropTypes.object.isRequired,
    boardActions: PropTypes.object.isRequired,
    profileId: PropTypes.string.isRequired,
    profiles: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      large_grid: [],
      medium_grid: [],
      small_grid: []
    }
  }

  componentWillReceiveProps (props) {
    // if (!_.isEqual(this.props, props)) {
    //   this.setState({
    //     ...this.state,
    //     large_grid: props.board.large_grid,
    //     medium_grid: props.board.medium_grid,
    //     small_grid: props.board.small_grid
    //   })
    // }
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
    console.log(grid)
    this.props.boardActions.updateGrid(grid)
  }

  onResizeStop = (grid) => {
    console.log(grid)
    this.props.boardActions.updateGrid(grid)
  }
  render () {
    const {
      hasSoundBoardGame,
      profiles,
      profileId,
      board: {
        selected_board
      }
    } = this.props
    const profile = _.find(profiles, (prof) => { return prof.id === profileId })
    return (
      <div className='board-editor-container'>
        <div className='board-editor-title'>Interactive Board{profile ? ' | ' + profile.name : null}</div>
        <div className='board-editor'>
        {hasSoundBoardGame
          ? null
          : <div className='no-game'>
            Looks like you don't have a soundboard game in the Beam Dev Labs.
            <div className='add-game-container'>
              <span className='add-game' onClick={this.createGame}>Create Soundboard</span>
            </div>
          </div>
        }
        </div>
      </div>
    )
  }

  renderBoard = () => {
    const {
      board,
      profileId,
      board: {
        selected_board
      }
    } = this.props
    const showBack = this.showBoard.bind(this, '')
    return (
      <div className={`board ${selected_board}`}>
        {profileId
          ? <div className='board-editor-wrapper'>
            <div className='board-background-grid'>
              {this.renderBackgroundGrid(selected_board)}
              { /* this.renderEditorGrid(selected_board, board[selected_board + '_grid'], 'grid-button') */}
              {this.renderProfileGrid(selected_board)}
            </div>
            <div className='board-actions'>
              <div className='board-action back' data-tip='Back'
                onClick={showBack}><div className='sicon-back'></div></div>
              <div className='board-action add' data-tip='Add Button'
                onClick={this.addButtonToBoard}>
                <div className='sicon-round-add'></div>
              </div>
              <div className='board-action save' data-tip='Save To Beam'>
                <div className='sicon-round-check'></div>
              </div>
            </div>
          </div>
          : <div className='board-no-profile'>
            <div className='board-back'data-tip='Back'
              onClick={showBack}><div className='sicon-back'></div></div>
            <div className='board-select-profile'>Please Select A Profile</div>
          </div>}
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
      </div>
    )
  }

  renderProfileGrid = (selected_board) => {
    switch (selected_board) {
      case 'large':
        return (
          <ReactGridLayout
            layout={this.state.large_grid}
            className='profile-grid large'
            cols={16}
            rowHeight={30}
            maxRows={4}
            width={600}
            margin={[5, 5]}
            onDragStop={this.onDragStop}
            onResizeStop={this.onResizeStop}
            verticalCompact>
            {
              this.state.large_grid.map((button) => {
                return (
                  <div key={button.i} className='grid-button'>
                    <div className='button-number'>{button.i}</div>
                    <div className='button-name'>{button.name}</div>
                  </div>
                )
              })
            }
          </ReactGridLayout>
        )
    }
  }

  renderBackgroundGrid = (grid) => {
    switch (grid) {
      case 'large':
        return this.renderBackgroundGridDetails(grid, 16, 30, 600, [5, 5], 'large-grid-box')
      case 'medium':
        return this.renderBackgroundGridDetails(grid, 9, 20, 200, [3, 3], 'large-grid-box')
      case 'small':
        return this.renderBackgroundGridDetails(grid, 6, 20, 200, [3, 3], 'large-grid-box')
    }
  }

  renderBackgroundGridDetails = (grid, cols, rowHeight, width, margin, box_class) => {
    let gridArr = []
    switch (grid) {
      case 'large':
        gridArr = largeGrid
        break
      case 'medium':
        gridArr = mediumGrid
        break
      case 'small':
        gridArr = smallGrid
        break
    }
    return (
      <ReactGridLayout
        layout={gridArr}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        margin={margin}
        verticalCompact={false} >
        {gridArr.map((item) => {
          return (
            <div className={box_class} key={item.i}></div>
          )
        })}
      </ReactGridLayout>
    )
  }

  renderSelector = () => {
    const showLarge = this.showBoard.bind(this, 'large')
    const showMedium = this.showBoard.bind(this, 'medium')
    const showSmall = this.showBoard.bind(this, 'small')
    return (
      <div className='board-size-selector'>
        <div className='board-size'>
          <div className='board-size-header'>Large</div>
          <div className='board-size-image large' onClick={showLarge}>
            <div className='board-grid'>
              {this.renderBackgroundGridDetails('large', 16, 8, 180, [3, 3], 'grid-box')}
            </div>
          </div>
        </div>
        <div className='board-size'>
          <div className='board-size-header'>Medium</div>
          <div className='board-size-image medium' onClick={showMedium}>
            <div className='board-grid'>
              {this.renderBackgroundGridDetails('medium', 9, 8, 110, [3, 3], 'grid-box')}
            </div>
          </div>
        </div>
        <div className='board-size'>
          <div className='board-size-header'>Small</div>
          <div className='board-size-image small' onClick={showSmall}>
            <div className='board-grid'>
              {this.renderBackgroundGridDetails('small', 6, 8, 70, [3, 3], 'grid-box')}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  board: state.board,
  profileId: state.profiles.profileId,
  profiles: state.profiles.profiles
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  boardActions: bindActionCreators(boardActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardEditor)
