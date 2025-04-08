import React from 'react'
import Layout from './components/Layout.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import CoffeeForm from './components/CoffeeForm.jsx'
import History from './components/History.jsx'
import { useAuth } from './Context/AuthContext.jsx'
import { coffeeConsumptionHistory } from './utils/index.js'

function App() {

  const { globalUser, isLoading, globalData } = useAuth()
  const isAuthenticated = globalUser
  const isData = globalData && !!Object.keys(globalData || {}).length 

  const isAuthenticatedContent = ( 
    <>
    <Stats />
    <History />
    </>
  )

  return (
   <Layout>
      <Hero />
      <CoffeeForm isAuthenticated={isAuthenticated}/>
      {(isAuthenticated && isLoading) && (
        <p>Loading data...</p>
      ) }
      {(isAuthenticated && isData) &&(isAuthenticatedContent)}
      </Layout>
  ) 
}

export default App
