import types from './types'

export interface IMeetingState{
    localStream:MediaStream | null,
    remoteStream: MediaStream | null,
    isChannelReady :boolean,
    isInitiator :boolean,
    isStarted:boolean
}

const initialState:IMeetingState={
    localStream:null,
    remoteStream:null,
    isChannelReady:false,
    isInitiator:false,
    isStarted:false
}

export interface IMeetingAction{
    type:string,
    payload: MediaStream | boolean 
}


 const reducer=(state:IMeetingState=initialState,action:IMeetingAction):IMeetingState=>{

    switch(action.type){
        case types.setLocalStream:
            if( typeof action.payload !== 'boolean'){
                return{
                    ...state,
                    localStream:action.payload
                }
            }
            return state
            
        
        case types.setRemoteStream:
            if( typeof action.payload !== 'boolean'){
                return{
                    ...state,
                    remoteStream:action.payload
                }
            }
            return state
            
        
        case types.setIsChannelReady:
            if(typeof action.payload === 'boolean'){
                return{
                    ...state,
                    isChannelReady:action.payload
                }
            }
            return state
            
        
        case types.setIsInitiatorReady:
            if(typeof action.payload === 'boolean'){
                return{
                    ...state,
                    isInitiator:action.payload
                }
            }
            return state
            
        
        case types.setIsStarted:
            if(typeof action.payload === 'boolean'){
                return{
                    ...state,
                    isStarted:action.payload
                }
            } 
            return state
        
        default:
            return state
            
    }

}

export default reducer