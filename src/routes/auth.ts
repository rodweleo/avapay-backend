
import express from "express"
import { logger } from "../utils/logger";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { JWT_SECRET, SERVER_PASSWORD_HASH } = process.env

const AuthRouter = express.Router();

AuthRouter.post("/login", async (req, res): Promise<any> => {
    if (!req.body) {
        logger.warn('Missing request body: username & password')
        return res.status(401).json({ message: "Missing request body: Username & Password" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        logger.warn('Missing username & password')
        return res.status(401).json({ message: "Missing username & Password" });
    }

    try {
        const isMatch = await bcrypt.compare(password, SERVER_PASSWORD_HASH!);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        logger.info(`Generating access token for ${username}...`)
        const accessToken = jwt.sign({ username }, JWT_SECRET!, { expiresIn: '1h' });

        logger.info("Access token generated...")
        res.json({
            accessToken,
            expiresIn: 3600
        });
    } catch (e: any) {
        logger.error(`Error whole logging in: ${JSON.stringify(e)}`)
        console.log('Error while logging in: ', e)
        res.status(500).json({ error: "Failed to login", details: e.message });
    }
})

export default AuthRouter