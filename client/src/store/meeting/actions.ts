import types from './types'
import { IAction } from './reducer'

export const setLocalStream=(stream:MediaStream):IAction=>{
    return{
        type:types.setLocalStream,
        payload:stream
    }
}

export const setRemoteStream=(stream:MediaStream):IAction=>{
    return{
        type:types.setRemoteStream,
        payload:stream
    }
}

export const setIsChannelReady=(value:boolean):IAction=>{
    return{
        type:types.setIsChannelReady,
        payload:value
    }
}

export const setIsInitiatorReady=(value:boolean):IAction=>{
    return{
        type:types.setIsInitiatorReady,
        payload:value
    }
}

export const setIsStarted=(value:boolean):IAction=>{
    return{
        type:types.setIsStarted,
        payload:value
    }
}