import React, { useEffect, useState } from 'react'
import UserComponent from '../components/OrderComponent'
import LogOut from '../components/LogOut'

export default function UserPage() {

  return (
    <>
      <LogOut />
      <UserComponent />
    </>
  )
}
