const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { sendSMS } = require("../utils/sms")
const Posts = require("../models/Posts")
const { checkEmpty } = require("../utils/checkEmpty")

exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "you are not Logged In. Please Login Again" })
    }
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailcode: otp })

    await sendEmail({
        to: result.email,
        subject: "Verify Email",
        message: `<p>your otp ${otp}</p>`
    })

    res.json({
        message: "Verification Send Success"
    })
})
exports.verifyEmailOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "you are not Logged In. Please Login Again" })
    }
    if (otp != result.emailcode) {
        return res.status(404).json({ message: "Invalid OTP" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true })
    res.json({ message: "Email Verify Success" })
})
exports.verifyMobileOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "you are not Logged In. Please Login Again" })
    }
    if (otp != result.mobilecode) {
        return res.status(404).json({ message: "Invalid OTP" })
    }
    const updeteUser = await User.findByIdAndUpdate
        (req.loggedInUser,
            { mobileVerified: true },
            { new: true }
        )
    res.json({
        message: "Mobile Verify Success", result: {
            _id: updeteUser._id,
            name: updeteUser.name,
            email: updeteUser.email,
            mobile: updeteUser.mobile,
            avatar: updeteUser.avatar,
            emailVerified: updeteUser.emailVerified,
            mobileVerified: updeteUser.mobileVerified,
        }
    })
})
exports.VerifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobilecode: otp })
    await sendSMS({
        message: `Welcome to SKILLHUB.Your OTP is ${otp}`,
        numbers: `${result.mobile}`
    })
    res.json({ message: "Mobile Verify Success" })
})

exports.addPost = asyncHandler(async (req, res) => {
    const { title, desc, price, images, location, category, gps } = req.body
    const { error, isError } = checkEmpty({ title, desc, price, images, location, category })
    if (isError) {
        return res.status(400).json({ message: "All Fields Required", error })
    }
    if (gps) {
        //api call to opencagedata

        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPEN_CAGE_API_KEY}f&q=${location.latitude}%2C${location.longitude}&pretty=1&no_annotations=1`)

        const x = await response.json()
        console.log(x)

    }
    //modify this code to support cloudnary

    // await Posts.create({ title, desc, price, images, location, category, user: req.loggedInUser })
    res.json({ message: "Post create success" })
})