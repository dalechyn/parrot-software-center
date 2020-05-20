import { createStore } from 'redux';
import rootReducer from './root.reducer';
import middleware from './middleware';
// rehydrate state on app start
const initialState = {};

// create store
const store = createStore(rootReducer, initialState, middleware);

// export store singleton instance
export default store;