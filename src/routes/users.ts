
import express from "express"

const UserRouter = express.Router();

UserRouter.get("/", async (req, res) => {
    res.json({
        message: "Users route is live"
    })
})

export default UserRouter