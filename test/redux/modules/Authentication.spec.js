import reducer, { initialState } from 'redux/modules/Authentication'

describe('(Redux) Authentication', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
