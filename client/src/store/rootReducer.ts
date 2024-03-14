import {combineReducers,Reducer} from "redux";
import meetingReducer,{IMeetingState,IMeetingAction} from './meeting/reducer'

export interface IRootreducer{
    meeting:IMeetingState,
}

const rootReducer=combineReducers({
    meeting:meetingReducer
})

export default rootReducer