const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")

exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailcode: otp })

    const isSend = await sendEmail({
        to: result.email,
        subject: "Verify Email",
        message: `<p>your otp ${otp}</p>`
    })

    res.json({
        message: "Verification Send Success", result: {
            _id: result._id,
            name: result.name,
            password: result.password,
            avatar: result.avatar,
            emailVerified: result.emailVerified,
            mobileVerified: result.emailVerified,
            mobile: result.mobile,
        }
    })
})