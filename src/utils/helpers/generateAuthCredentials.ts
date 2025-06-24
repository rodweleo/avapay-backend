import crypto from 'crypto';
import bcrypt from 'bcrypt';

const username = crypto.randomBytes(128).toString('hex'); // 12-char hex
const password = crypto.randomBytes(128).toString('hex'); // 13+ base64 chars

bcrypt.hash(password, 15, (err, hash) => {
    if (err) throw err;
    console.log('Generated Credentials:\n');
    console.log(`USERNAME=${username}`);
    console.log(`PASSWORD=${password}`);
    console.log(`PASSWORD_HASH=${hash}`);
});
