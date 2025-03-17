import bcrypt from "bcrypt";
import generateAndSetCookies from "../utils/generateToken.js";
import User from "../models/userModel.js";
import fetch from 'node-fetch';
import { addRegistration } from "./orderController.js";

export const signUp = async (req, res) => {
    try {
        const { Companyname, State, City, Password, MobileNo, GST_No, PAN_No, Address, Pincode, Email, OwnerName, OwnerNo, AccountantName, AccountantNo, PurchaserName, PurchaserNo } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ MobileNo });
        if (user) {
            console.log("User already exists");
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(Password, salt);

        // Generate a temporary token and verification link
        const tempToken = Math.floor(Math.random() * 9000000) + 1000000;
        const tempLink = `<a href="https://fifth-season-decor-order-app-4s37.onrender.com/api/auth/user/userVerification/${tempToken}?MobileNo=${MobileNo}" 
   style="
     display: inline-block;
     background-color: #009900;
     color: white;
     padding: 12px 24px;
     text-decoration: none;
     border-radius: 8px;
     font-weight: bold;
     font-size: 16px;
     text-align: center;
     margin-top: 25px;
     margin-bottom: 25px;
     transition: background-color 0.3s ease;
   ">
  Verify User
</a>`;
        // const tempLink = `<a href="https://order-flow-api-ek8r.onrender.com/api/auth/user/userVerification/${tempToken}?MobileNo=${MobileNo}">Verify User</a>`;

        // Create the new user instance
        let newUser = new User({
            Companyname,
            MobileNo,
            Password: hashPassword,
            State,
            City,
            GST_No,
            PAN_No,
            Address,
            Pincode,
            Email,
            OwnerName,
            OwnerNo,
            AccountantName,
            AccountantNo,
            PurchaserName,
            PurchaserNo,
            Temp_Token: tempToken,
            Authorized: false
        });

        // Prepare form data for the email notification
        const formData = {
            Companyname,
            "MobileNo/LoginId": MobileNo,
            State,
            City,
            GST_No,
            PAN_No,
            Address,
            Pincode,
            Email,
            OwnerName,
            OwnerNo,
            AccountantName,
            AccountantNo,
            PurchaserName,
            PurchaserNo,
        };

        // Send an email notification
        try {
            // let response = await fetch(`https://forms-flow.onrender.com/api/sendmail/mail/custom/22amtics298@gmail.com`, {
            // let response = await fetch(`https://forms-flow.onrender.com/api/sendmail/mail/custom/deorah_76@yahoo.com`, {
            let response = await fetch(`https://forms-flow.onrender.com/api/sendmail/mail/custom/customer_registration@fifthseasonsdecor.com`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heading: "A new registration for order application. Do you want to allow it?",
                    formData,
                    text: tempLink
                })
            });

            if (!response.ok) {
                throw new Error(`Email notification failed with status: ${response.status}`);
            }

            // Save the new user to the database
            await newUser.save();

            // Retrieve the saved user for the response
            user = await User.findOne({ MobileNo });

            res.status(200).json({
                message: "Sign Up Success"
            });
        } catch (fetchError) {
            console.error("Error sending email notification:", fetchError);
            res.status(500).json({ message: "Failed to send notification email. Please try again later." });
        }
    } catch (error) {
        console.error("Error in Signup:", error);
        res.status(500).json({ error: error.message });
    }
};

export const userVerification = async (req, res) => {
    const tempToken = req.params.tempToken;
    const MobileNo = req.query.MobileNo;
    try {
        let user = await User.findOne({ MobileNo });
        if (!user) {
            res.status(404).json({ message: "No user found" })
            return
        }
        if (tempToken == user.Temp_Token) {
            if (user.Authorized == false) {
                user.Authorized = true
                await user.save()
                await addRegistration(user);
                res.status(200).json({ message: "user verified" })
            }
            else{
                res.status(200).json({ message: "User already verified" })
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Invalid Token" })
    }
}

export const login = async (req, res) => {
    try {
        const { MobileNo, Password } = req.body;
        let user = await User.findOne({ MobileNo: MobileNo });
        if (!user) {
            res.status(500).json("No User Exist");
        }
        else {
            const isMatch = await bcrypt.compare(Password, user.Password);
            // console.log(user.Password)
            if (isMatch) {
                if (user.Authorized == true) {
                    const token = generateAndSetCookies(user._id, res);
                    res.status(200).json({
                        userData: {
                            _id: user._id,
                            Companyname: user.Companyname,
                            State: user.State,
                            City: user.City,
                            MobileNo: user.MobileNo,
                            OwnerName: user.OwnerName,
                            OwnerNo: user.OwnerNo,
                            AccountantName: user.AccountantName,
                            AccountantNo: user.AccountantNo,
                            PurchaserName: user.PurchaserName,
                            PurchaserNo: user.PurchaserNo
                        }, jwt: token
                    })
                } else {
                    res.status(401).json("User Not Authorized")
                }
            }
            else {
                res.status(400).json("Password is incorrect");
            }
        }
    } catch (error) {
        console.log("Error in Login", error);
        res.status(500).json({ error: error.message });
    }
}