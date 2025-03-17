import React, { useEffect, useState } from 'react'
import YourOrder from '../components/YourOrderComponent';
import LogOut from '../components/LogOut';

export default function OrderPage() {

  return (
    <>
      <LogOut />
      <YourOrder />
    </>
  )
}
