
import express from "express"
import { prisma } from "../utils/prisma";

const UserRouter = express.Router();

UserRouter.get("/", async (req, res) => {
    const allUsers = await prisma.user.findMany()
    console.log(allUsers)
    res.json({
        message: "We are live"
    })
})

export default UserRouter