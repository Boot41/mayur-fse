import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {Signup} from "./components/Signup";
import {Login} from "./components/Login";
import {Home} from "./components/Home";
import {Navigation} from './components/Navigation';
import {Logout} from './components/Logout';
import SelectRole from './components/SelectRole';
import Dashboard from './components/Dashboard';

function App() {
    return (
      <BrowserRouter>
        <Navigation></Navigation>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/select-role" element={<SelectRole/>}/>
          <Route path="/dashboard/*" element={<Dashboard/>}/>
        </Routes>
      </BrowserRouter>
    )     
}
export default App;