import { Container, Table, Stack, Button, Spinner } from 'react-bootstrap';
import '../index.css'
import { useState, useEffect } from 'react';
import { TrashFill, EyeFill, PencilFill} from 'react-bootstrap-icons';
import { Error, Success } from './shared/Alerts';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import {SpinnerComponent} from './shared/SpinnerComponent';

//Table with cebtered content in cells
function PagesTable(props) {
    const [pages, setPages] = useState([])
    const [deleted, setDeleted] = useState(false)
    const [message, setMessage] = useState('')
    const [showMessage, setShowSuccessMessage] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    useEffect(() => {
        setPages([])
        if(props.username_logged && props.mode == 'frontoffice') {
            API.getAllPagesByAuthenticatedUser().then((response) => {
                setPages(response)
                setLoading(false)
            }).catch((err) => {
                setMessage(err.error)
                setShowErrorMessage(true)
                setPages([])
            })

        } else {
            API.getAllPagesByGuest().then((response) => {
                setPages(response)
                setLoading(false)
            }).catch((err) => {
                setMessage(err.error)
                setShowErrorMessage(true)
                setPages([])
            })
        }
        setDeleted(false)
    }, [deleted, props.mode, props.status, props.username_logged])

    return (
        <>
            <div>
                {showMessage ? <Success message={message} setShowMessage={setShowSuccessMessage}/> : null}
                {showErrorMessage ? <Error message={message} setShowMessage={setShowErrorMessage}/> : null}
            </div>
            {
                !loading ?
                <>
                    <Container className='mt-3 vh-100' style={{overflow: "auto"}}fluid >
                        <div className='d-flex justify-content-between p-3'>
                            <h1>Contents</h1>
                            {props.role == 'creator' || props.role == 'admin' ?
                                <Button className='teal-color' onClick={() => {
                                    props.setStatus('add')
                                    navigate('/creator/add')
                                }}>
                                    Create Page
                                </Button> : null
                            }
                        </div>
                        <div className='table-wrapper'>
                            <Table className='teal-soft-color text-center' hover responsive>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Author</th>
                                        <th>Title</th>
                                        <th>Created</th>
                                        <th>Pubblicated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages && pages.map((page, index) => <Row setStatus={props.setStatus} username_logged= {props.username_logged} mode={props.mode} setShowSuccessMessage={setShowSuccessMessage} setShowErrorMessage={setShowErrorMessage}  setMessage={setMessage} key={index} role={props.role} {...page} setDeleted={setDeleted}/>)}
                                </tbody>
                            </Table> 
                        </div>
                    </Container>
                </>
                :
                <>
                    <SpinnerComponent/>
                </>

            }
        </>
    )
}

function Row(props) {
    return (
        <tr>
            <th>{props.type}</th>
            <th>{props.username}</th>
            <th>{props.title}</th>
            <th>{props.creationDate}</th>
            <th>{props.pubblicationDate}</th>
            <th>
               <Actions username_logged = {props.username_logged} mode={props.mode} setShowSuccessMessage={props.setShowSuccessMessage} setShowErrorMessage={props.setShowErrorMessage} setMessage={props.setMessage} username={props.username} pageid={props.id} setDeleted={props.setDeleted} role={props.role} setStatus={props.setStatus}/>
            </th>
        </tr>
    )
}

function Actions(props) {
    const handleDeletePage = (pageid) => {
        API.deletePage(pageid).then((response) => {
                props.setDeleted(true)
                props.setMessage("Page deleted successfully")
                props.setShowErrorMessage(false)
                props.setShowSuccessMessage(true)
        }).catch((response) => {
                props.setMessage(response.error)
                props.setShowSuccessMessage(false)
                props.setShowErrorMessage(true)
        })
    }

    const navigate = useNavigate()
    return (
        <Stack direction="horizontal" className='justify-content-evenly'>
            <Button className='teal-color' onClick={() => {
                props.setStatus('view')
                navigate(`/page/${props.pageid}`)
                }}>
                <EyeFill size={20} />
            </Button>
            {(props.username_logged && props.mode == 'frontoffice' && props.username_logged == props.username) || (props.role === 'admin' && props.mode == 'frontoffice') ?
                <>
                    <Button className='teal-color' onClick={() => {
                        props.setStatus('edit')
                        navigate(`/creator/edit/${props.pageid}`)
                    }}>
                        <PencilFill size={20}/>  
                    </Button>
                    <Button className='teal-color' onClick={() => handleDeletePage(props.pageid)}>
                        <TrashFill size={20} />  
                    </Button>
                </>  : null
            }
        </Stack>
    )
}

export { PagesTable }