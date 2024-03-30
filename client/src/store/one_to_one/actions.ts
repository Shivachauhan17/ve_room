import types from './types'

export const setIsInitiator=(value:boolean)=>{
    return{
        type:types.setIsInitiator,
        payload:value
    }
}