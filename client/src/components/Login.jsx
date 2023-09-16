import { Stack, Col, Row, Form, Button, Image, Spinner, Alert } from 'react-bootstrap';
import 'react-icons';
import '../index.css'
import { useState, useEffect } from 'react';
import { MyNavbar } from './shared/MyNavbar';
import { Error } from './shared/Alerts';
import { useNavigate } from 'react-router-dom';
import { BoxArrowRight, BoxArrowInRight } from 'react-bootstrap-icons';

function LoginForm(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [showPassowordError, setShowPasswordError] = useState(false)
    const [showUsernameError, setShowUsernameError] = useState(false)
    const [showAuthError, setShowAuthError] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate();
  
    useEffect(() => {
        setLoading(false)
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault();
        if(!validateForm(username, password)){
            event.stopPropagation();
        } else {
            const credentials = { username, password };

            props.handleLogin(credentials)
              .then(() => {
                props.setStatus('table')
                navigate( "/" )
              }).catch((err) => {
                setError(err.error);
                setShowAuthError(true);
            });
        }

    };

    const validateForm = (username, password) => {
        if(username.length === 0  && password.length === 0 ){
            setShowUsernameError(true)
            setShowPasswordError(true)
            return false
        } else if(username.length === 0) {
            setShowUsernameError(true)
            return false
        } else if(password.length === 0) {
            setShowPasswordError(true)
            return false
        }

        return true
    }

    return (
        //with border, login
        <>
            {showAuthError ? <Error message={error} setShowMessage={setShowAuthError}/> : null}
                <Stack gap={3} direction="horizontal" className='background-color-beige'>
                    <div className="ms-auto text-color-white" >
                        <div>

                        </div>
                        <Stack direction='vertical' className='d-flex justify-content-evenly vh-100'>
                            <Row>
                            </Row>
                            { !loading ? 
                            <Row className='rounded teal-gradient shadow-box'>
                                <Col>
                                    <Stack direction='vertical' className='p-3'gap={5}>
                                        <Row>
                                            <h1 className='text-center'>Login</h1>
                                        </Row>
                                        <Row>
                                            <Form>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Email address</Form.Label>
                                                    <Form.Control required type="email" placeholder="Enter email" className='shadow-box' 
                                                        onChange={(event) => {
                                                            setUsername(event.target.value)
                                                            setShowUsernameError(false)
                                                            setShowAuthError(false)
                                                        }}
                                                    />
                                                    {showUsernameError ? <Form.Text className="text-danger">Please enter your email</Form.Text> : null}
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control required type="password" placeholder="Enter password" className='shadow-box'
                                                        onChange={(event) => {
                                                            setPassword(event.target.value)
                                                            setShowPasswordError(false)
                                                            setShowAuthError(false)
                                                        }}
                                                    />
                                                    {showPassowordError ? <Form.Text className="text-danger">Please enter your password</Form.Text> : null}
                                                </Form.Group>
                                                <Col className='d-flex justify-content-end'>
                                                    <Button className="teal-color shadow-box" variant="primary" type="submit" onClick={(event) => handleSubmit(event)}>
                                                        Submit
                                                    </Button>  
                                                </Col>
                                            </Form>
                                        </Row>
                                    </Stack>
                                </Col>
                                <Col className='d-flex p-0 justify-content-end'>
                                    <Image className='rounded-end' src="/login.jpg" fluid />
                                </Col>
                            </Row> :
                            <>
                                <Spinner animation="border" variant="dark" />
                            </>
                            }
                            <Row></Row>
                        </Stack>
                    </div>
                    <div className="ms-auto"></div>
                </Stack>
        </>
    )
}

function LogoutButton(props) {
    const navigate = useNavigate();
    return (
        <Button className='ms-2 teal-color border'  onClick={() => {
            props.setStatus('table')
            navigate('/')
            props.handleLogout()
        }}> Logout
            <BoxArrowRight size={30} className='ps-2'/>
        </Button>
    )
}
  
function LoginButton(props) {
    const navigate = useNavigate();
    return (
        <Button className='ms-2 teal-color border' onClick={()=> {
                props.setStatus('login')
                navigate('/login')
            }
        }>
            Login
            <BoxArrowInRight size={30} className='ps-2' />
        </Button>
    )
}
export { LoginForm, LogoutButton, LoginButton }