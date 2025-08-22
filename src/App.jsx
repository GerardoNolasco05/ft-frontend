import { Routes, Route } from 'react-router-dom';
import Home from '/src/pages/Home'
import Login from '/src/pages/Login'
import Register from '/src/pages/Register'
import KnowledgeHub from '/src/pages/KnowledgeHub'

function App(){
  return(
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/knowledgehub' element={<KnowledgeHub/>} />
    </Routes>

  )
}

export default App;
