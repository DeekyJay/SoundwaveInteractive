import reducer, { initialState } from 'redux/modules/Sounds'

describe('(Redux) Sounds', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
