import Agent from '@/components/Agent'
import React from 'react'

function Page() {
  return (
   <>
    <h3>Interview Generation</h3>
    <Agent userName="You" userId="1" type="generate" />
   </>
  )
}

export default Page