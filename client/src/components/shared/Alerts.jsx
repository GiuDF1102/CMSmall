import React from 'react'
import { Alert } from 'react-bootstrap'

export function Error(props) {
  return (
    <>
        <Alert variant='danger' style={{position: 'fixed', width:'-webkit-fill-available', textAlign:'center'}}   onClose={() => props.setShowMessage(false)} dismissible>
            <p>
                {props.message}
            </p>    
        </Alert>
    </>
  )
}

export function Success(props) {
    return (
        <>
            <Alert variant='success' style={{position: 'fixed', width:'-webkit-fill-available',  textAlign:'center'}}   onClose={() => props.setShowMessage(false)} dismissible>
                <p>
                    {props.message}
                </p>    
            </Alert>
        </>
      )
}
