import { BrowserRouter, Routes, Route, Navigate, Outlet  } from 'react-router-dom';
import { LoginForm } from './components/Login';
import { PageEditorView } from './components/PageEditorView';
import { PageView } from './components/PageView';
import { NotFound } from './components/NotFound';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PagesTable } from './components/PagesTable';
import { useState, useEffect } from 'react';
import API from './API';
import { MyNavbar } from './components/shared/MyNavbar';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({role: 'guest'});
  const [loggingIn, setLoggingIn] = useState(false)
  const [status, setStatus] = useState('table');
  const [mode, setMode] = useState('backoffice')


  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); setLoading(false);
      } catch (err) {
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.


  /**
 * This function handles the login process.
 * It requires a username and a password inside a "credentials" object.
 */
const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout handleLogout={handleLogout} role={user ? user.role : 'guest'} status={status} setStatus={setStatus} username={user ? user.username_name : ''} mode={mode} setMode={setMode}/>}>
          <Route path="/login" element={<LoginForm handleLogin={handleLogin} handleLogout={handleLogout} setStatus={setStatus}/>} />
          <Route path="/" element={<PagesTable role={user ? user.role : ''} username_logged={user ? user.username_name : undefined } mode={mode} setMode={setMode} setStatus={setStatus} setLoggingIn={setLoggingIn}  handleLogout={handleLogout}/>}/>
          <Route path='/creator/add' element={loggedIn ? <PageEditorView  username={user.username_name} status={status} setStatus={setStatus} handleLogout={handleLogout}/> : <Navigate replace to='/login' />}/>
          <Route path='/creator/edit/:pageid' element={loggedIn ? <PageEditorView  role={user.role} handleLogout={handleLogout} setStatus={setStatus}/> : <Navigate replace to='/login' />}/>
          <Route path='/page/:pageid' element={<PageView setStatus={setStatus} handleLogout={handleLogout}/>} />
          <Route path='*' element={<NotFound/>}/>
        </Route>
      </Routes>

    </BrowserRouter>
  )
}

function Layout(props) {
  return (
    <>
      <MyNavbar role={props.role} status={props.status} setStatus={props.setStatus} username={props.username} mode={props.mode} setMode={props.setMode} handleLogout={props.handleLogout} />
      <Outlet/>
    </>
  )
}

export default App
