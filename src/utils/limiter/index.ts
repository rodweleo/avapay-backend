import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 10 minutes
	limit: 50,
	standardHeaders: 'draft-8',
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})