const jwt = require('jsonwebtoken')
const config = require('../config/auth.config')
const db = require('../models/index')

const User = db.user
const Role = db.role

// Function to verify our user has a valid token

verifyWebToken = (req, res, next) => {
    let token = req.headers['x-access-token']

    if(!token) {
        return res.status(403).send({message: 'No token provided!'})
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.status(401).send({message: 'Unauthorized'})
        }
        req.userId = decoded.id
        next()
    })
}

// Function to verify if user is admin or not

// isAdmin = (req,res,next) => {
//     User.findOne({username: req.body.username}).exec((err, user)=>{
//         console.log(user)
//         if(err) {
//             return res.status(500).send({message:err})
//         }
//         Role.find({
//             // _id: {$in: user.roles}
//             _id: '5fe2bc0e58b92f20d053cdc9'
//         }, (err, roles)=> {
//             if(err) {
//                 return res.status(500).send({message: err})
//             }
//             console.log(user.roles, roles)
//             for(let i = 0; i < roles.length; i++) {
//                 if(roles[i].name === 'admin') {
//                     next()
//                     return
//                 }
//             }

//             res.status(403).send({message: `Requires admin role`})
//         })
//     })
// }

isAdmin = (req, res, next) => {
    // .exec return the urser we want to have access too ( if im not mistaken .then will not)
    User.findOne({_id: req.userId}).exec((err, user) => {
        // throwing an erro becuase this user does not exist
        if (err) {
            return res.status(500).send({message: err})
        }
        // find users role if the user exiss
        Role.find({
            _id: { $in: user.roles}
        }, (err, roles)=> {
            if (err) {
               return res.status(500).send({message: err})
            }
            // loop through returnes roles and check if theres an admin role
            for (let i = 0; i < roles.length; i++) {
                if(roles[i].name === 'admin'){
                    next()
                    return
                }
            }
            // if no admin role round, send status 403 message
            res.status(403).send({message: "Requires admin Role"})
        })
    })
}

const authJwt = {
    verifyWebToken,
    isAdmin
}

module.exports = authJwt