import React from 'react'
import { Container, Button, Stack, Image, Spinner} from 'react-bootstrap'
import '../index.css'
import { useParams } from 'react-router-dom'
import { MyNavbar } from './shared/MyNavbar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Error } from '../components/shared/Alerts'
import API from '../API';

function PageView(props) {

  const { pageid } = useParams();
  const [load, setLoad] = useState(false);
  const [loadedPage, setLoadedPage] = useState({});
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    API.getPageByID(pageid).then((response) => {
      let parsedPage = {
        page: {
          authorID: response.page.username,
          type: response.page.type,
          title: response.page.title,
          creationDate: response.page.creationDate,
          pubblicationDate: response.page.pubblicationDate
        },
        content: response.content.sort((a, b) => (a.position > b.position) ? 1 : -1)
      }
      setLoadedPage(parsedPage)
      setLoad(true)
    }).catch((err) => {
      setMessage(err.error)
      setShowErrorMessage(true)
      setLoadedPage({})
    })
  }, [load])

  return (
    <div style={{overflow: "auto"}}>
      <div>
        {showErrorMessage ? <Error message={message} setShowMessage={setShowErrorMessage}/> : null}
      </div>
      { load ? <PageViewInner setStatus={props.setStatus} title={loadedPage.page.title} contents={loadedPage.content} key={loadedPage.page.id} author={loadedPage.page.authorID}/> 
              : <p> Loading... </p> }
    </div>
  )
}

function handleAdd(element, index) {
    if(element.type === 'header') {
        return <Header text={element.content} key={index} />
    } else if (element.type === 'paragraph') {
        return <Paragraph text={element.content} key={index} />
    } else if (element.type === 'image') {
        return <Picture link={element.content} key={index} />
    } else {
    }
}


function PageViewInner(props) {
  const navigate = useNavigate();

  return (
    <Container fluid className='pt-2 vh-100' style={{overflow: "auto"}}>
      <Stack direction="horizontal" className=' d-flex justify-content-between m-3' gap={5}>
        <Stack direction="vertical" gap={3}>
          <h2 className='m-0'>{props.title}</h2>
          <p className='m-0'>by {props.author}</p>
        </Stack>
        <Button className='teal-color' onClick={() => {
          props.setStatus('table')
          navigate(-1)
        }}>
          Go back to table
        </Button>
      </Stack>      
      {props.contents.map((element, index) => handleAdd(element,index))}
    </Container>
  )
}

function Header(props) {
  return (
    <Container  className='shadow-box p-3 mb-3' fluid>
      <p className='text-center' style={{fontWeight: 'bold', fontStyle: 'italic'}}>
        {props.text}
      </p>
    </Container>
  )
}

function Picture(props) {
    return (
      <div className='d-flex justify-content-center m-3 shadow-box'>
        <Image src={`${props.link}`}></Image>
      </div>
    )
}

function Paragraph(props) {
  return (
    <Container className='shadow-box p-3 mb-3' fluid>
      <p>
        {props.text}
      </p>
    </Container>
  )
}


export { PageView }