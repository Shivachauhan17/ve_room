import React,{memo,Ref} from 'react'

interface ISendMessageBoxRef{
    textReference:Ref<HTMLTextAreaElement> | null;
    sendBtnReference:Ref<HTMLButtonElement> | null
}

function SendMessageBox({textReference,sendBtnReference}:ISendMessageBoxRef) {


  return (
    <div>
        <textarea 
        ref={textReference}
        rows={4}
        cols={50}
         />
        <button value={'Send'} ref={sendBtnReference}/>
    </div>
  )
}

export default memo(SendMessageBox)