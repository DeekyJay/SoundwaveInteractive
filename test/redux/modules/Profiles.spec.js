import reducer, { initialState } from 'redux/modules/Profiles'

describe('(Redux) Profiles', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
