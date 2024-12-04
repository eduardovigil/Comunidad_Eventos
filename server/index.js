const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    // Here you would verify the password. For security reasons, Firebase Admin SDK doesn't provide a way to verify passwords directly.
    // You might need to implement your own password verification logic or use a different authentication method.
    
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(400).send('Error logging in');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

