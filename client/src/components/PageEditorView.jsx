import dayjs from 'dayjs'
import API from '../API'
import React from 'react'
import '../index.css'

import { Container, Form, FloatingLabel, Button, Stack, Image } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { PencilFill } from 'react-bootstrap-icons'
import { HeaderEditor, ParagraphEditor, PictureEditor } from './shared/Blocks'
import { useNavigate, useParams } from 'react-router-dom'
import { Error, Success } from './shared/Alerts'
import { SpinnerComponent } from './shared/SpinnerComponent'


function findVectorsBlocks(oldBlocks, newBlocks) {
  let up = [];
  let add = [];
  for (let b of newBlocks) {
    if (!b.id) {
      add.push(b);
    } else {
      let i = oldBlocks.findIndex((x) => x.id == b.id);
      if (i >= 0) {
        if (
          oldBlocks[i].type !== b.type ||
          oldBlocks[i].content !== b.content ||
          oldBlocks[i].position !== b.position
        )
          up.push(b);
        oldBlocks = oldBlocks.filter((x) => x.id !== b.id);
      }
    }
  }

  return { add: add, del: oldBlocks, up: up };
}

function PageEditorView(props) {
  const navigate = useNavigate()
  const { pageid } = useParams()

  const [AddingPicture, setAddingPicture] = useState(false)
  const [AddingParagraph, setAddingParagraph] = useState(false)
  const [AddingHeader, setAddingHeader] = useState(true)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [addPageDisabled, setaddPageDisabled] = useState(true)
  const [content, setContent] = useState([])
  const [pubblicationDate, setPubblicationDate] = useState('')
  const [creationDate, setCreationDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [message, setMessage] = useState('')
  const [showMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [new_page, setNewPage] = useState({
    page: {
      authorID: props.username,
      type: "draft", 
      title: title, 
      creationDate: dayjs().format('YYYY-MM-DD'),
      pubblicationDate: pubblicationDate
    },
    content: []
  })
  
  const handleSave = () => {
    //if pageid is null then create a new page
    if(pageid == null) {
      API.createPage(new_page).then((response) => {
        setShowSuccessMessage(false)
        setMessage("Page created successfully")
        setShowSuccessMessage(true)
      }).catch((error) => {
        console.log(error);
        setShowErrorMessage(false)
        setMessage(error)
        setShowErrorMessage(true)
      })
    } else {
      let lists = findVectorsBlocks(new_page.old_content, new_page.content)
      new_page.lists = lists
      API.updatePage(pageid, new_page).then((response) => {
        setShowSuccessMessage(false)
        setMessage("Page saved successfully")
        setShowSuccessMessage(true)
      }).catch((error) => {
        setShowErrorMessage(false)
        setMessage(error)
        setShowErrorMessage(true)
      })
    }
  }

  const handleSetAuthor = (setEditingAuthor, newAuthor) => {
    let temp = {...new_page}
    temp.page.authorID = author
    if(!(author.length == 0)) {
      setNewPage(temp)
      API.setAuthor(newAuthor, pageid).then((response) => {
        setMessage("Author changed successfully")
        setAuthor(newAuthor)
        setShowSuccessMessage(true)
      }).catch((err) => {
        setMessage(err)
        setShowErrorMessage(true)
        setAuthor(new_page.page.authorID)
      })
      setEditingAuthor(false)
    }
  }

  const handleSetTitle = (newTitle, setEditingTitle) => {
    let temp = {...new_page}
    temp.page.title = newTitle
    if(!(newTitle.length == 0)) {
      setNewPage(temp)
      setEditingTitle(false)
    } else {
      setMessage('Title cannot be empty')
      setShowErrorMessage(true)
    }
  }
  
  const handleChangePubblicationDate = (date) => {
    let temp = {...new_page}
    const currentDate = dayjs();
    const inputDate = dayjs(date);
  
    if (inputDate.isBefore(currentDate, 'day')) {
        setMessage('You cannot set a date in the past')
        setShowErrorMessage(true)
        return currentDate.format('YYYY-MM-DD')
    } else if (inputDate.isAfter(currentDate, 'day')) {
        temp.page.type = 'scheduled'
        temp.page.pubblicationDate = date
        setNewPage(temp)
        return date
    } else {
        temp.page.type = 'published'
        temp.page.pubblicationDate = date
        setNewPage(temp)
        return date
    }
  
  }
  
  useEffect(() => {
    if(pageid != null) {
      API.getPageByID(pageid).then((response) => {
        let parsedPage = {
          page: {
            authorID: response.page.username,
            type: response.page.type,
            title: response.page.title,
            creationDate: response.page.creationDate,
            pubblicationDate: response.page.pubblicationDate
          },
          old_content: [...response.content.map((x => Object.assign({},x))).sort((a, b) => (a.position > b.position) ? 1 : -1)],
          content: [...response.content.map((x => Object.assign({},x))).sort((a, b) => (a.position > b.position) ? 1 : -1)]
        }
        setNewPage(parsedPage)
        setTitle(parsedPage.page.title)
        setCreationDate(parsedPage.page.creationDate)
        setPubblicationDate(parsedPage.page.pubblicationDate ? parsedPage.page.pubblicationDate : '')
        setAuthor(parsedPage.page.authorID)
        setLoading(false)
        setAddingHeader(false)
      }).catch((error) => {
        setShowErrorMessage(false)
        setMessage(error.error)
        setShowErrorMessage(true)       
      })
    } else {
      setLoading(false)
      //just for page creation
      setAuthor(props.username)
    }
  }, [loading])

  useEffect(() => {
    //if number of headers is at least 1 and number of paragraphs/images is at least one then enable create page button
    if (new_page.content.length > 0) {
    
      let headers = 0
      let paragraphs = 0
      let images = 0
    
      new_page.content.forEach(item => {
        if (item.type == 'header') headers++
        if (item.type == 'paragraph') paragraphs++
        if (item.type == 'image') images++
      })
    
      if (headers > 0 && (paragraphs > 0 || images > 0))
        setaddPageDisabled(false)
      else
        setaddPageDisabled(true)
    
      } else 
        setaddPageDisabled(true)
    
        //rerender header creator when there is not content
        if (new_page.content.length == 0) {
          setAddingHeader(true)
        }

  }, [new_page])
  
  return (
    <Container fluid className='pt-2 vh-100' style={{overflow: "auto"}}>
      <div>
          {showMessage ? <Success message={message} setShowMessage={setShowSuccessMessage}/> : null}
          {showErrorMessage ? <Error message={message} setShowMessage={setShowErrorMessage}/> : null}
      </div>
      { !loading ? 
        <>
            <Stack direction="horizontal" className='d-flex justify-content-between m-3' gap={5}>
              <Stack>
                <Title title = {title} setTitle={setTitle} new_page={new_page} setNewPage={setNewPage} handleSetTitle={handleSetTitle} />
                <Author handleSetAuthor={handleSetAuthor} author={author} setAuthor={setAuthor} role={props.role} />
              </Stack>
                <Button className='teal-color' disabled={addPageDisabled} onClick={() => handleSave()}>
                  {pageid? "Save Page" : "Create Page"}
                </Button>
                <Button className='teal-color' onClick={() => {
                  props.setStatus('table')
                  navigate('/')
                }}>
                  Go back to table
                </Button>
            </Stack>
            <Form className='mb-3'>
              <Stack direction="horizontal" className='d-flex justify-content-end m-3'>
              <Form.Group className='me-3'>
                <Form.Label >Creation Date</Form.Label>
                <Form.Control disabled
                  value = {creationDate}
                  type="date"
                  placeholder="Add a creation date..."
                  onChange={(e) => {
                    let temp = {...new_page}
                    temp.page.creationDate = e.target.value
                    setNewPage(temp)
                    setaddPageDisabled(false)
                  }}
                />        
              </Form.Group>
              <Form.Group>
                <Form.Label >Pubblication Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Add a pubblication date..."
                  value={pubblicationDate}
                  onChange={(e) => {
                    setPubblicationDate(handleChangePubblicationDate(e.target.value, new_page, setNewPage, setMessage, setShowErrorMessage))
                  }}
                />
              </Form.Group>
              </Stack>
            </Form>      
            {new_page.content.sort((a, b) => a.position - b.position).map((item, index) => (
              <div key={index}>
                {(item.type == 'header') ? <HeaderEditor id={index} text={item.content} position={item.position} setNewPage={setNewPage} new_page={new_page}/> :
                ((item.type == 'paragraph') ? <ParagraphEditor id={index} text={item.content} position={item.position} setNewPage={setNewPage} new_page={new_page}/> : 
                <PictureEditor id={index} link={item.content} position={item.position} setNewPage={setNewPage} new_page={new_page} set/> )}
              </div>
            ))}
            {AddingHeader ? <HeaderAdder new_page={new_page} setNewPage={setNewPage} setAddingHeader={setAddingHeader}  setContent={setContent} content={content} /> : null}
            {AddingPicture ? <PictureAdder setMessage={setMessage} setShowErrorMessage={setShowErrorMessage} new_page={new_page} setNewPage={setNewPage} setAddingPicture={setAddingPicture} setContent={setContent} content={content} /> : null}
            {AddingParagraph ? <ParagraphAdder  new_page={new_page} setNewPage={setNewPage} setAddingParagraph={setAddingParagraph}  setContent={setContent} content={content} /> : null}
            {((!AddingHeader && !AddingParagraph && !AddingPicture)) ? <ContentAdder setAddingHeader={setAddingHeader} setAddingPicture={setAddingPicture} setAddingParagraph={setAddingParagraph}/> : null}
        </>
        :
        <>
          <SpinnerComponent/>
        </>
    }
    </Container>
  )
}

function Title(props) {
  const [editingTitle, setEditingTitle] = useState(false)
  
  if (!editingTitle) {
    return (
        <div className='d-flex'>
          <h1>{props.title.length != 0 ? props.title : "Add a title..."}</h1>
          <PencilFill size={30} className='ps-2' onClick={() => setEditingTitle(true)}/>
        </div>
    )
  } else {
    return (
      <>
        <Form.Control
          value={props.title}
          type="text"
          placeholder="Press enter to confirm..."
          className='mb-2'
          onKeyUp={(e) => ((e.key === 'Enter')) ? props.handleSetTitle(e.target.value, setEditingTitle) : null}
          onChange={(e) => props.setTitle(e.target.value)} 
        />
      </>
    )
  }
}

function Author(props) {
  const [editingAuthor, setEditingAuthor] = useState(false)
  const [newAuthor, setNewAuthor] = useState(props.author)
  
  if (!editingAuthor) {
    return (
        <div className='d-flex'>
          <p className='m-0'>by {props.author}</p>
          { props.role == 'admin' ?
            <PencilFill size={25} className='ps-2' onClick={() => setEditingAuthor(true)}/>
            : null
          }
        </div>
    )
  } else {
    return (
      <>
        <Form.Control value={newAuthor}
          type="text"
          placeholder="Press enter to confirm..."
          className='mb-2'
          onKeyUp={(e) => ((e.key === 'Enter')) ? props.handleSetAuthor(setEditingAuthor, newAuthor) : null}
          onChange={(e) => setNewAuthor(e.target.value)} 
        />
      </>
    )
  }
}

function HeaderAdder(props) {
  const [headerText, setHeaderText] = useState('')
  const {setNewPage, new_page} = props

  return (
    <FloatingLabel className='shadow-box p-2 mb-2' >
      <Stack direction="vertical" >
        <div>
          <Form.Control
            as="textarea"
            placeholder="Add an header to your page..."
            style={{ height: '100px' }}
            onChange={(e) => setHeaderText(e.target.value)}
          />
        </div>
        <div className='d-flex justify-content-end'>
          <Button  className='teal-color me-2 mt-2' 
            onClick={ () => {
              if(new_page.content.length == 0) {
                alert('You need at least one header')
              } else {
                props.setAddingHeader(false)
              }
            }}>
            Cancel
          </Button>
          <Button className='teal-color mt-2' onClick={() => {
              props.setAddingHeader(false);
              setNewPage((old)=>({...old, content:[...old.content, {type: 'header', content: headerText, position:new_page.content.length}]}))
              }}>
            Add
          </Button>
        </div>
      </Stack>
    </FloatingLabel>
  )
}

function PictureAdder(props) {

  const {setNewPage, new_page} = props
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

  return(
    <div className='shadow-box mb-3 p-3'>
      <h4>Select a picture</h4>
      <Stack direction='horizontal'>
        {pictures.map((picture,ind) => <PictureThumbnail key={ind} new_page = {new_page} setNewPage={setNewPage} setAddingPicture={props.setAddingPicture}
        content={props.content} id={picture.id} link={picture.link} setContent={props.setContent}/>)}
      </Stack>
      <div className='d-flex justify-content-end'>
        <Button className='teal-color me-3 mt-2'
          onClick={() => props.setAddingPicture(false)}>
            Go Back
        </Button>
      </div>
    </div>
  )
}

function PictureThumbnail(props) {
  const {setNewPage, new_page} = props
  return (
    <div className='d-flex justify-content-center me-2'>
      <Image thumbnail 
        key={props.id} 
        src={`${props.link}`} 
        onClick={() => {
          props.setAddingPicture(false)
          setNewPage((old)=>({...old, content:[...old.content, {type: 'image', content: props.link, position:new_page.content.length}]}))
          // props.new_page.content.push({type: 'image', content: props.id, position:num_content, link: props.link})

        }}
      />
    </div>
  )
}

function ContentAdder(props) {

  return (
    <div className='d-flex justify-content-center mb-5'>
      <Button className='teal-color mt-2 me-2 shadow-box' onClick={() => props.setAddingHeader(true)}>
        Add an header
      </Button>
      <Button className='teal-color mt-2 me-2 shadow-box' onClick={() => props.setAddingPicture(true)}>
        Add Picture
      </Button>
      <Button className='teal-color mt-2 shadow-box' onClick={() => props.setAddingParagraph(true)}>
        Add Paragraph
      </Button>
    </div>
  )

}

function ParagraphAdder(props) {
  const [paragraphText, setParagraphText] = useState('')
  const {setNewPage, new_page} = props

  return (
    <FloatingLabel className='shadow-box p-2' >
      <Stack direction="vertical" >
        <div>
          <Form.Control
            as="textarea"
            placeholder="Write here..."
            style={{ height: '100px' }}
            onChange={(e) => setParagraphText(e.target.value)}
          />
        </div>
        <div className='d-flex justify-content-end'>
        <Button  className='teal-color me-2 mt-2' onClick={() => props.setAddingParagraph(false)}>
            Cancel
          </Button>
          <Button className='teal-color mt-2' onClick={() => {
              props.setAddingParagraph(false);
              setNewPage((old)=>({...old, content:[...old.content, {type: 'paragraph', content: paragraphText, position:new_page.content.length}]}))
              // props.new_page.content.push({type: 'paragraph', content: paragraphText, position:num_content})
              }}>
            Add
          </Button>
        </div>
      </Stack>
    </FloatingLabel>

  )
}


export { PageEditorView }