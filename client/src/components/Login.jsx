import axios from "axios"
import {useState} from "react"

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        const user = {
            email: email,
            password: password
        };
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

        const { data } = await axios.post(`${API_BASE_URL}/token/`, 
            user, 
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        localStorage.clear()
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);     
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;           
        window.location.href = "/dashboard/";
    }

    return(
        <div className="Auth-form-container">
          <form className="Auth-form" onSubmit={submit}>
            <div className="Auth-form-content">
              <h3 className="Auth-form-title">Sign In</h3>
              <div className="form-group mt-3">
                <label>Email</label>
                <input className="form-control mt-1" 
                  placeholder="Enter Email" 
                  name='email'  
                  type='email' value={email}
                  required 
                  onChange={e => setEmail(e.target.value)}/>
              </div>
              <div className="form-group mt-3">
                <label>Password</label>
                <input name='password' 
                  type="password"     
                  className="form-control mt-1"
                  placeholder="Enter password"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}/>
              </div>
              <div className="d-grid gap-2 mt-3">
                <button type="submit" 
                   className="btn btn-primary">Submit</button>
              </div>
            </div>
         </form>
       </div>
    )
}