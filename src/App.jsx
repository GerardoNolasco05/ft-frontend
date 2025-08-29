// Third-party libraries
import { Routes, Route } from 'react-router-dom';

// Application pages
import Home from '/src/pages/Home'
import Login from '/src/pages/Login'
import Register from '/src/pages/Register'
import Exercises from './pages/Exercises';
import Clients from './pages/Clients';
import Coaches from './pages/Coaches';

// Layout components
import RootLayout from './components/RootLayout';
import WithDashboardLayout from './components/WithDashboardLayout';
import RequireAuth from './components/RequireAuth';


function App(){
  return(
   <Routes>
  {/* Navbar always visible inside RootLayout */}
  <Route element={<RootLayout />}>
    {/* No-dashboard routes */}
    <Route index element={<Home />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />

      {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<WithDashboardLayout />}>
            <Route path="clients/:id?" element={<Clients />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="coaches/:id" element={<Coaches />} />
          </Route>
        </Route>
    </Route>

    {/* Optional fallback */}
    {/* <Route path="*" element={<NotFound />} /> */}
</Routes>
  )
}

export default App;
