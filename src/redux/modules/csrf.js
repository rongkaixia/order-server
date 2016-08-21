const LOAD = 'redux-example/csrf/LOAD';

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        _csrf: action.csrf
      };
    default:
      return state;
  }
}

export function load(csrf) {
  return {
    type: LOAD,
    csrf: csrf
  };
}
