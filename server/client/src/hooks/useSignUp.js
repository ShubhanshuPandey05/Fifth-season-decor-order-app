import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";

const useSignUp = () => {
    const navigator = useNavigate();
    const {setIsAuth} =useAuthContext();
    const { showLoading, hideLoading } = useLoading();


    const signUp = async (data) => {

        const success = handleErrorInputs(data.Companyname, data.State, data.City, data.Password, data.MobileNo, data.GST_No, data.PAN_No, data.OwnerName, data.OwnerNo, data.AccountantName, data.AccountantNo, data.PurchaserName, data.PurchaserNo);

        if (!success) return; 
        showLoading();

        let response = await fetch("/api/auth/signUp/",{
        // let response = await fetch("https://order-flow-api-ek8r.onrender.com/api/auth/signUp/",{
        // let response = await fetch("https://order-flow-api.vercel.app/api/auth/signUp/",{
        // let response = await fetch("http://localhost:8000/api/auth/signUp/",{
            method: "post",
            headers: {
                "Content-Type": "application/json",
              },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        const result = await response.json()
        if(response.ok){
            // localStorage.setItem('authUser', JSON.stringify(result))
            // setIsAuth(true)
            navigator("/login");
            hideLoading();
            toast.success("Sign Up Success");
        }else{
            navigator("/signUp");
            hideLoading();
            toast.error(result.message);
            // toast.error("not signup")
        }
    }
    return {signUp};
}


function handleErrorInputs(Companyname, State, City, password, MobileNo, GST_No, PAN_No, OwnerName, OwnerNo, AccountantName, AccountantNo, PurchaserName, PurchaserNo) {
    if (!Companyname || !State || !password || !MobileNo || !City || !OwnerName || !OwnerNo || !AccountantName || !AccountantNo || !PurchaserName || !PurchaserNo) {
        toast.error('Please fill all the required fields');
        return false;
    }else if (password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return false;
    }else if (GST_No.length != 15 && GST_No.length > 0){
        toast.error('Invalid GST Number')
        return false;
    }else if (PAN_No.length != 10 && PAN_No.length > 0){
        toast.error('Invalid PAN Number')
        return false;
    }else if (MobileNo.length != 10){
        toast.error('Invalid Phone No.')
        return false;
    }
    return true;
}
export default useSignUp;