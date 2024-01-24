const express = require('express');
const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();


router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const encrypt = await bcrypt.hash(password, 10);

  const checkEmail = await prisma.users.findFirst({
    where: {
      email: email
    }
  });

  if (checkEmail) {
    return res.status(400).json({
      error: "email",
      status: false,
      message: "This email is already registered"
    });
  }

  const create = await prisma.users.create({
    data: {
      email: email,
      password: encrypt
    }
  });

  res.status(201).json({
    status: true,
    message: "Successfully registered."
  });
});

router.post('/login', async (req, res) => {
  try {
    const user = await prisma.users.findUnique({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({
        error: "email",
        status: false,
        message: "This user not found"
      });
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
      return res.status(400).json({
        error: "password",
        status: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign({_id: user.id}, process.env.TOKEN_SECRET_KEY );
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 //1 day
    })
    res.status(200).json({
        status: true,
        message: "Successfully Login"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
});

router.get('/user-verify',async(req,res)=>{
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie,process.env.TOKEN_SECRET_KEY);
        if(!claims){
            return res.status(200).json({
                auth: false,
                data: 'unauthenticated'
            })
        }
        const {password, ...data} = await prisma.users.findUnique({where:{ id: claims._id}})
        res.json({
          auth: true,
          data: data
        });
    } catch (error) {
        return res.status(200).json({
          auth: false,
          data: 'unauthenticated'
        })
    }
})

router.post('/logout',(req,res)=>{
    res.cookie('jwt','',{maxAge:0})
    res.send({
        message: "Successfully Logout"
    })
})

module.exports = router;
