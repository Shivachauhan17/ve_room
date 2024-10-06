import types from './types'
import { IMeetingAction } from './reducer'

export const setLocalStream=(stream:MediaStream)=>{
    return{
        type:types.setLocalStream,
        payload:stream
    }
}

export const setRemoteStream=(stream:MediaStream)=>{
    return{
        type:types.setRemoteStream,
        payload:stream
    }
}

export const setIsChannelReady=(value:boolean)=>{
    return{
        type:types.setIsChannelReady,
        payload:value
    }
}

export const setIsInitiatorReady=(value:boolean)=>{
    return{
        type:types.setIsInitiatorReady,
        payload:value
    }
}

export const setIsStarted=(value:boolean)=>{
    return{
        type:types.setIsStarted,
        payload:value
    }
}

export const setRoom=(value:string)=>{
    return{
        type:types.setRoom,
        payload:value
    }
}

export const setOffer=(value:boolean)=>{
    return{
        type:types.setOffer,
        payload:value
    }
}

export const setGotUserMedia=(value:boolean)=>{
    return{
        type:types.setGotUserMedia,
        payload:value
    }
}