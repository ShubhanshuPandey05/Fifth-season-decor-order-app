import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useLoading } from '../context/LoadingContext';


export default function ForgotPassword() {
    const [mobileNo, setMobileNo] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();


    const handleSendOtp = async (e) => {
        showLoading()
        e.preventDefault();
        // Replace with API call to send OTP
        let respone = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNo })

        })
        if (respone.ok) {
            setOtpSent(true);
            toast.success("Otp sent successfully")
            hideLoading()
        }
        else {
            toast.error("Error sending Otp try again later")
            hideLoading();
        }
        hideLoading()
    };

    const handleResetPassword = async (e) => {
        showLoading();
        e.preventDefault();
        let respone = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp, newPassword })

        })
        if (respone.ok) {
            toast.success("Password reset successfully");
            hideLoading()
            navigate('/login');
        }
        else {
            toast.error("Error sending Otp try again later")
            hideLoading();
        }
        hideLoading();
        console.log('Resetting password for:', mobileNo, otp, newPassword);
    };

    return (
        <div className='flex justify-center items-center min-h-screen md:bg-gray-100'>
            <form
                onSubmit={otpSent ? handleResetPassword : handleSendOtp}
                className='max-w-md mx-auto my-10 p-8 bg-white rounded-lg md:shadow-md w-96'
            >
                <h2 className='text-3xl font-bold mb-8 text-center'>Reset Password</h2>

                {!otpSent&&<input
                    type='text'
                    name='mobileNo'
                    className='h-12 p-4 mb-4 w-full border rounded-lg'
                    placeholder='Mobile No.'
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    required
                />}

                {otpSent && (
                    <>
                        <input
                            type='text'
                            name='otp'
                            className='h-12 p-4 mb-4 w-full border rounded-lg'
                            placeholder='Enter OTP'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />

                        <div className='relative w-full'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='newPassword'
                                className='h-12 p-4 mb-6 w-full border rounded-lg'
                                placeholder='New Password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-4 top-3 text-gray-500'
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </>
                )}

                <button
                    type='submit'
                    className='w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700'
                >
                    {otpSent ? 'Reset Password' : 'Send OTP'}
                </button>
            </form>
        </div>
    );
}