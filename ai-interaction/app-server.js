const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const path = require('path');

const app = express();
const port = 4550;

app.use(express.static(path.join(__dirname, '/chat-ui')));  // Ensure this matches your directory structure
app.use(bodyParser.json());

const projectId = 'winter-sequence-432612-q3';
const sessionId = '12345';
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'path/to/your/service-account-file.json'  // Update with actual path
});

app.post('/message', async (req, res) => {
    const message = req.body.message;

    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        res.json({ response: result.fulfillmentText });
    } catch (error) {
        console.error('ERROR:', error);
        res.json({ response: 'Sorry, something went wrong.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
