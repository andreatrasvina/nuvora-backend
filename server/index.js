import express from 'express'

const port = process.env.PORT ?? 3001;

const app = express();

app.get('/', (req, res) => {
    res.send('<h1>CHAT. This is my chat!!!</h1>');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});