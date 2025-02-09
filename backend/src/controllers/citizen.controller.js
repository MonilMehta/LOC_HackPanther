import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Citizen } from "../models/citizen.models.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const citizen = await Citizen.findById(userId)
        const accessToken = citizen.generateAccessToken()
        const refreshToken = citizen.generateRefreshToken()

        citizen.refreshToken = refreshToken
        await citizen.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
} 

const sendVerificationSMS = async(phoneNo, fullname) => {
    try {
        console.log(phoneNo, fullname)
        const accountSid = process.env.ACCOUNTSID;
        const authToken = process.env.AUTHTOKEN;
        const client = new twilio(accountSid, authToken);
        const parsedPhoneNumber = parsePhoneNumberFromString(phoneNo, 'IN');
        if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
            throw new ApiError(400, "Invalid phone number");
        }
        const formattedPhoneNumber = parsedPhoneNumber.format('E.164');
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const message = await client.messages.create({
            body: `Hi ${fullname}, Your OTP for Police Digital Portal is ${otp}. Please enter this code to verify your account. This OTP is valid for 10 minutes.`,
            to: formattedPhoneNumber,
            from: '+19362274129'
        });
        return otp;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new ApiError(500, error);
    }
}

const registerCitizen = asyncHandler( async ( req, res ) => {

    const { email, phoneNo, fullname, password } = req.body

    if(
        [email, phoneNo, fullname, password].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await Citizen.findOne({
        $or: [{ phoneNo }, { email }]
    })
    if(existingUser){
        throw new ApiError(409, "User with email or phone number already exists")
    }

    console.log(phoneNo, fullname)
    const otp = await sendVerificationSMS(phoneNo, fullname);

    const user = await Citizen.create({
        email, phoneNo, fullname, password, isVerified: false, verificationToken: otp
    })

    const createdUser = await Citizen.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "User Registration Successful"
        )
    )

})

const loginCitizen = asyncHandler( async ( req, res ) => {

    const { email, phoneNo, password } = req.body

    if(!(phoneNo || email)){
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await Citizen.findOne({
        $or: [{phoneNo}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await Citizen.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Login Successful"
        )
    )

})

const logoutCitizen = asyncHandler( async ( req, res ) => {

    Citizen.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logout Successful"
        )
    )
})

const refreshAccessToken = asyncHandler( async ( req, res ) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await Citizen.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

const changeCurrentPassword = asyncHandler( async ( req, res ) => {

    const { oldPassword, newPassword, confirmPassword } = req.body

    if(!(oldPassword && newPassword && confirmPassword)){
        throw new ApiError(400, "All passwor fields are required")
    }

    if(!(newPassword === confirmPassword)){
        throw new ApiError(400, "New Password and Confirm Password do not match")
    }

    const user = await Citizen.findById(req.user?._id)

    const isPassCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPassCorrect){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentCitizen = asyncHandler( async ( req, res ) => {

    const { userId } = req.query;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    const user = await Citizen.findById(userId).select("-password -isVerified -refreshToken -verificationToken");

    if(!user){
        throw new ApiError(404, "User not found or email not verified");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "User profile fetched successfully"
        )
    );
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id; 
    const { email, phoneNo, fullname } = req.body;

    if (!(fullname || email || phoneNo)) {
        throw new ApiError(400, "At least one field (fullName or email or phone no) is required.");
    }

    const user = await Citizen.findByIdAndUpdate(
        userId, 
        {
            $set: {
                ...(fullname && { fullname }), 
                ...(email && { email }),
                ...(phoneNo && { phoneNo }),
            }
        },
        {
            new: true,
            runValidators: true 
        }
    ).select("-password"); 


    if (!user) {
        throw new ApiError(404, "Error updating account details. User not found.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    );
});

const verifyCitizen = asyncHandler( async ( req, res ) => {

    const { phoneNo, token } = req.body;

    if(!phoneNo || !token){
        throw new ApiError(400, "Verification token and phone number is required")
    }

    try{
        const user = await Citizen.findOne({ phoneNo });
    
        if(!user){
            throw new ApiError(404, "User not found");
        }
    
        if(user.isVerified){
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Citizen is already verified"
                )
            );
        }
        if(user.verificationToken !== token) {
            throw new ApiError(401, "Invalid verification token");
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Email has been verified successfully"
            )
        );
    } catch(error){
        throw new ApiError(401, "Invalid or expired verification token");
    }
})

export { registerCitizen , loginCitizen, logoutCitizen, refreshAccessToken, changeCurrentPassword, getCurrentCitizen, updateAccountDetails, verifyCitizen }
