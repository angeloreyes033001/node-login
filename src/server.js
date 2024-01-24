const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const user_router = require('./routers/users.router');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5173"]
}));
app.use('/api/user',user_router)

const port = process.env.PORT | 3000

app.listen(port,()=>{
    console.log(`Port running on ${port}`)
});