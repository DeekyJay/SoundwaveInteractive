import reducer, { initialState } from 'redux/modules/App'

describe('(Redux) App', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
