import React from 'react'
import { EmojiFrown } from 'react-bootstrap-icons';
import { Button, Row } from 'react-bootstrap';
import { MyNavbar } from './shared/MyNavbar';
import { useNavigate } from 'react-router-dom';

function NotFound(props) {
    const navigate = useNavigate();

    return (
      <div>
        <h1 className='text-center m-3'>404 - Not Found</h1>
        <h1 className='text-center'>
          <EmojiFrown size={100}/>
        </h1>
        <div className='d-flex justify-content-center'>
            <Button className='teal-color m-3' onClick={
                () => {
                    //go back to last page
                    navigate(-1);
                }
            }>
                Go back
            </Button>
        </div>
      </div>
    )
  }

export { NotFound}