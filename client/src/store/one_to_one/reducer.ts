import types from './types'

export interface Ione2one{
    isInitiator:boolean
}

const initialValue={
    isInitiator:false
}

export interface Iaction{
    type:string,
    payload:boolean
}

const reducer=(state:Ione2one=initialValue,action:Iaction):Ione2one=>{
    switch(action.type){
        case types.setIsInitiator:
            return{
                ...state,
                isInitiator:action.payload
            }
        default:
            return state
    }
}


export default reducer