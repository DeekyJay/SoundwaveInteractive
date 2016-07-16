import reducer, { initialState } from 'redux/modules/Board'

describe('(Redux) Board', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
