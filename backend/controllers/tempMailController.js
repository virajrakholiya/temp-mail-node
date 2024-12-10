const TempMail = require("node-temp-mail");

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const generateTempMail = async (req, res) => {
    try {
        const randomUsername = generateRandomString(10);
        const address = new TempMail(randomUsername);
        const emailAddress = address.getAddress();
        
        // Ensure we're sending a string
        if (typeof emailAddress === 'string') {
            res.json({ email: emailAddress });
        } else {
            res.json({ email: emailAddress.address }); // TempMail might return an object
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const fetchEmails = async (req, res) => {
    try {
        const { email } = req.body;
        const username = email.split('@')[0];
        
        // Set timeout to 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
        
        const fetchPromise = new TempMail(username).fetchEmails();
        
        // Race between fetch and timeout
        const emails = await Promise.race([fetchPromise, timeoutPromise]);
        
        res.json({ emails: emails.messages || [] });
    } catch (error) {
        if (error.message === 'Timeout') {
            res.status(408).json({ message: 'Request timeout' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    generateTempMail,
    fetchEmails
}; 