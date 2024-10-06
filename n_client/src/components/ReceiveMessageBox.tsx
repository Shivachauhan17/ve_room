import React, { memo, Ref } from 'react';

interface IReceiveMessageBox {
    textReference: Ref<HTMLTextAreaElement> | null;
  }
  
  function ReceiveMessageBox({ textReference }: IReceiveMessageBox) {
    return (
        <div>
        <textarea 
        ref={textReference}
        rows={4}
        cols={50}
         />
    </div>
    );
  }
  
  export default memo(ReceiveMessageBox);