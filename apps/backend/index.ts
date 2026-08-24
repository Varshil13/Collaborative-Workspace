import { prisma } from "db/client";
import express from "express";

const app = express();
app.use(express.json())

app.post('/signup' , async(req,res) => {
    const {username , password} = req.body;
    await prisma.user.create ({
        data : {
            username,
            password
        }
    })

    res.json({
        message : "Signed Up"
    })


})

app.listen(3000);