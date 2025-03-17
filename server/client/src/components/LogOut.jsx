import React from 'react'
import useLogOut from '../hooks/useLogOut'
import { FiLogOut } from "react-icons/fi";


export default function LogOut() {
    const { logOut } = useLogOut()
    return (
        <button className='bg-[#cbbba700] text-[#78350f] py-2 px-2 rounded-xl top-1 left-1 fixed z-50 text-lg flex justify-center items-center' onClick={logOut}><FiLogOut className='mr-2 scale-x-[-1]'/> Logout</button>
    )
}
