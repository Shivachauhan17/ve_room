import types from './types'

export interface Ione2one{
    isInitiator:boolean,
    imageBase64:string,
    audioBase64:string
}

const initialValue={
    isInitiator:false,
    imageBase64:"",
    audioBase64:""
}

export interface Iaction{
    type:string,
    payload:boolean | string
}

const reducer=(state:Ione2one=initialValue,action:Iaction)=>{
    switch(action.type){
        case types.setIsInitiator:
            if(typeof action.payload==='string')
                return{
                    ...state,
                    isInitiator:action.payload
                }
                return state
        case types.setImage:
            if(typeof action.payload==='boolean')
            return{
                ...state,
                imageBase64:action.payload
            }
            return state
        case types.setAudio:
            if(typeof action.payload==='boolean')
            return{
                ...state,
                audioBase64:action.payload
            }
            return state
        default:
            return state
    }
}


export default reducer