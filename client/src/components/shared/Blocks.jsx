import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Image, Stack } from 'react-bootstrap';
import { handleModify, handleModifyPicture, handleChangePosition, handleDelete } from './utils'
import { ArrowUp, ArrowDown, TrashFill, PencilFill } from 'react-bootstrap-icons';
import API from '../../API'

function HeaderEditor(props) {
    const [newHeaderText, setNewHeaderText] = useState()
    //in bold and italic
    return (
      <Container className='shadow-box p-3 mb-3 d-flex justify-content-center' fluid>
        <Stack direction='vertical'>
          <Container  className='p-3 mb-3' fluid>
            {
              !newHeaderText ? 
                <p className='text-center' style={{fontWeight: 'bold', fontStyle: 'italic'}}>
                  {newHeaderText ? newHeaderText : props.text}
                </p> :
                <>
                  <div>
                    <Form.Control
                      as="textarea"
                      placeholder="Add an header to your page..."
                      style={{ height: '100px' }}
                      value={newHeaderText}
                      onChange={(e) => setNewHeaderText(e.target.value)}
                    />
                </div>
              </>
            }
          </Container>
          { !newHeaderText ? 
            <ContentButtons setModifyingContent={setNewHeaderText} id={props.id} position = {props.position} setNewPage={props.setNewPage} new_page={props.new_page} items={props.text}/> :
            <div className='d-flex justify-content-end'>
              <Button className='teal-color me-3'
                onClick={() => {
                  handleModify(props.id, newHeaderText, props.new_page, props.setNewPage, setNewHeaderText)
                }}>
                Confirm
              </Button>
            </div>
          }
        </Stack>
      </Container>
    )
  
  }

function ParagraphEditor(props) {
    const [newParagraph, setNewParagraph] = useState()
    return (
      <Container className=' shadow-box p-3 mb-3 d-flex justify-content-center' fluid>
        <Stack direction='vertical'>
        <Container  className='p-3 mb-3' fluid>
            {
              !newParagraph ? 
                <p>
                  {newParagraph ?  newParagraph : props.text}
                </p> :
                <>
                  <div>
                    <Form.Control
                      as="textarea"
                      style={{ height: '100px' }}
                      value={newParagraph}
                      onChange={(e) => setNewParagraph(e.target.value)}
                    />
                </div>
              </>
            }
          </Container>
          { !newParagraph ? 
            <ContentButtons setModifyingContent={setNewParagraph} id={props.id} position = {props.position} setNewPage={props.setNewPage} new_page={props.new_page} items={props.text}/> :
            <div className='d-flex justify-content-end'>
              <Button className='teal-color me-3'
                onClick={() => handleModify(props.id, newParagraph, props.new_page, props.setNewPage, setNewParagraph)}>
                Confirm
              </Button>
            </div>
          }
        </Stack>
      </Container>
    )
  }

  function PictureEditor(props) {

    const [newPicture, setNewPicture] = useState()
    const [loading, setLoading] = useState(true)
    const [pictures, setPictures] = useState([])
  
    useEffect(() => {
      API.getAllImages().then((res) => {
        setPictures(res)
        setLoading(false)
      }).catch((error) => {
        props.setShowErrorMessage(false)
        props.setMessage(error.error)
        props.setShowErrorMessage(true)
        props.setAddingPicture(false)
  
      })
    }, [loading])
      return (
        <Container className='shadow-box p-3 mb-3 d-flex justify-content-center' fluid>
          <Stack direction='vertical'>
            { !newPicture ?
              <div className='d-flex justify-content-center m-3'>
                <Image src={`${newPicture ?  newPicture : props.link}`}/>
              </div> :
              <div className='mb-3 p-3'>
                <h4>Select a picture</h4>
                <Stack direction='horizontal'>
                  {pictures.map((picture,ind) => 
                      <div className='d-flex justify-content-center me-2'>
                        <Image thumbnail 
                          key={ind} 
                          src={`${picture.link}`} 
                          onClick={() => {
                            handleModifyPicture(props.id, picture.link, props.new_page, props.setNewPage, setNewPicture)}
                          }/>
                    </div>
                  )}
                </Stack>
                <div className='d-flex justify-content-end'>
                  <Button className='teal-color me-3'
                    onClick={() => setNewPicture(newPicture)}>
                    Go Back
                  </Button>
                </div>
              </div>
            }
            { !newPicture ?
              <ContentButtons setModifyingContent={setNewPicture} id={props.id} position = {props.position}  setNewPage={props.setNewPage} new_page={props.new_page} items={props.link}/>
              : null
            }
          </Stack>
        </Container>
      )
  }

  function ContentButtons(props) {

    return (
      <div className='d-flex justify-content-center m-3'>
        <Button className='teal-color' disabled={props.position == 0} onClick={() => {
              handleChangePosition(props.new_page, props.setNewPage,props.position, props.position - 1)
            }
          }>
            <ArrowUp size={20} />
        </Button>
        <Button className='teal-color ms-2' disabled={props.position == props.new_page.content.length - 1} onClick={() => {
              handleChangePosition(props.new_page, props.setNewPage,props.position, props.position + 1)
            }}>
          <ArrowDown size={20} />
        </Button>
        <Button className='teal-color ms-2' onClick={() =>{handleDelete(props.id, props.new_page, props.setNewPage)}}>
            <TrashFill size={20} />
        </Button>
        <Button className='teal-color ms-2' onClick={()=> {
          props.setModifyingContent(props.items)
          }}>
            <PencilFill size={20} />
        </Button>
      </div>
  
    )
  }

export {
    HeaderEditor,
    ParagraphEditor,
    PictureEditor
}