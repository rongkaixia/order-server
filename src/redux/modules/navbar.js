const CHANGE_TO_BLACK = 'redux-example/navbar/CHANGE_TO_BLACK';
const CHANGE_TO_WHITE = 'redux-example/navbar/CHANGE_TO_WHITE';

const initialState = {
  color: "white"
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CHANGE_TO_BLACK:
      return {
        ...state,
        color: "black"
      };
    case CHANGE_TO_WHITE:
      return {
        ...state,
        color: "white"
      };
    default:
      return state;
  }
}

export function changeToBlack() {
  return {
    type: CHANGE_TO_BLACK,
  };
}

export function changeToWhite() {
  return {
    type: CHANGE_TO_WHITE,
  };
}
