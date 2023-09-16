import { Navbar, Form, Button } from 'react-bootstrap';
import { DatabaseGear, PencilFill } from 'react-bootstrap-icons';
import { LoginButton, LogoutButton } from '../Login';
import '../../index.css'
import { useEffect, useState } from 'react';
import API from '../../API';

function MyNavbar(props) {
    const [editingTitle, setEditingTitle] = useState(false)
    const [title, setTitle] = useState('') //FETCH FROM DB

    useEffect(() => {
        API.getWebsiteTitle()
            .then(title => {
                setTitle(title)
            })
            .catch(err =>{
                setTitle('CMSmall')
            })
    }, [])

    const handleChangeTitle = (title) => {
        API.updateWebsiteTitle(title).then((res) => {
            setEditingTitle(false)
            setTitle(title)
        }).catch((error) => {
            props.setMessage(error.error)
            props.setShowErrorMessage(true)
            setTitle('CMSmall')
        })

    }
    
    return (
        <Navbar className='teal-color pe-3 ps-3 text-color-white' fixed="top">
            <DatabaseGear size={30} className='pe-2'/>
            {
                editingTitle ?
                <Form.Control type="text" placeholder="Enter title" className='w-25' value={title} onChange={(e) => setTitle(e.target.value)} 
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        handleChangeTitle(title)
                    }
                }}/> 
                :
                <Navbar.Brand className='text-color-white ps-2'>{title}</Navbar.Brand>
            }
            {
                props.role === 'admin' ?
                <>
                    <PencilFill size={30} className='ps-2 pe-2' onClick={() => setEditingTitle(true)}/>
                </> :
                null
            }
            <Navbar.Toggle />
            { props.status === 'login' ? null :
                <Navbar.Collapse className="justify-content-end">
                    { (props.username) ?
                        <>
                            <Navbar.Text className='text-color-white'>
                                Signed in as: {props.username} ({props.role})
                            </Navbar.Text>
                            {
                                ((props.mode == 'backoffice' || props.mode == 'frontoffice') && props.status == 'table') ?
                                    <OfficeButton mode={props.mode} setMode={props.setMode}/> : null
    
                            }
                            <LogoutButton handleLogout={props.handleLogout} setStatus={props.setStatus}/>
                        </>
                        :
                        <>
                            <Navbar.Text className='text-color-white'>
                                Signed in as: Guest ({props.role})
                            </Navbar.Text>
                            <LoginButton  setStatus={props.setStatus}/>               
                        </>
                    }
                </Navbar.Collapse>
            }
        </Navbar>
      );
}

function OfficeButton(props) {
    return(
        (props.mode == 'backoffice') ? 
        <Button className='ms-2 teal-color border'
        onClick={
            () => props.setMode('frontoffice')
        }>
            Go to BackOffice
        </Button> :
        <Button className='ms-2 teal-color border'
        onClick={
            () => props.setMode('backoffice')
        }>

            Go to FrontOffice
        </Button>

    )
}

export { MyNavbar }