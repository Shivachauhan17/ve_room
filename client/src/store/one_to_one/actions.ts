import types from './types'

export const setIsInitiator=(value:boolean)=>{
    return{
        type:types.setIsInitiator,
        payload:value
    }
}

export const setImage=(value:string)=>{
    return{
        type:types.setImage,
        payload:value
    }
}

export const setAudio=(value:string)=>{
    return{
        type:types.setAudio,
        payload:value
    }
}