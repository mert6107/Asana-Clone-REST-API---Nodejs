const httpStatus = require("http-status");
const uuid = require("uuid");
const {eventEmitter} = require("../scripts/events/eventEmitter");
const {passwordToHash, generateAccessToken, generateRefreshToken} = require("../scripts/utils/helper");
const path = require("path");

const userService = require("../services/UserService");
const projectService = require("../services/ProjectService");

class User{

    create(req,res){
        req.body.password = passwordToHash(req.body.password);
        userService.create(req.body).then((response)=>{
            res.status(httpStatus.CREATED).send(response);
        })
            .catch((e)=>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
            })
    }

    index(req,res){
        console.log("controller",);
        userService.list().then(response => {
            res.status(httpStatus.OK).send(response)

        }).catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
    }

    login(req,res){
        req.body.password = passwordToHash(req.body.password);
        userService.findOne(req.body)
            .then(user => {
                if(!user){
                    res.status(httpStatus.NOT_FOUND).send({message:"There is no such user !"});
                    return;
                }
                user={
                    ...user.toObject(),
                    token:{
                        access_token: generateAccessToken(user),
                        refresh_token: generateRefreshToken(user)
                    }
                };

                delete user.password;
                res.status(httpStatus.OK).send(user);
            })
            .catch(e => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e))
    }

    projectList(req,res){
        projectService.list({user_id: req.user?._id}).then(projects => {
            res.status(httpStatus.OK).send(projects)
        }).catch(() => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({message:"While pull your project list, unexpected error occurred!"})
        });

    }

    resetPassword(req,res){
        const newPass = uuid.v4()?.split("-")[0];
        userService.updateCond({email:req.body.email},{password:passwordToHash(newPass)}).then(updatePass =>{
            if(!updatePass) {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"This email not found!"});
            }
            eventEmitter.emit("send_mail", {
                to: updatePass.email, // list of receivers
                subject: "Reset Password", // Subject line
                html: `Password reset has been performed upon your request.<br /> You don't forget change the password after logged<br/>New Password:<b>${newPass}</b>`, // html body
            });
            console.log("password",);
            res.status(httpStatus.OK).send({message:"Your password reset email has been sent."});
        }).catch(e => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred during resetting password!"});
        });
    }

    update(req,res){
        userService.update(req.user?._id,req.body).then(updated => {
            res.status(httpStatus.OK).send({message:"Updated user information successfully!"})
        }).catch(()=>{
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred during updating user information!"})
        });
    }

    updatePass(req,res){
        // UI GELDIKDEN SONRA ŞİFRE KARŞILAŞTIRMALARINA İLİŞKİN KURALLAR BURADA OLACAKTIR.
        req.body.password = passwordToHash(req.body.password);
        userService.update(req.user?._id,req.body).then(updated => {
            res.status(httpStatus.OK).send({message:"Updated user password successfully!"})
        }).catch(()=>{
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred during updating user password!"})
        });
    }

    deleteUser(req,res){
        if (!req.params?.id){
            return res.status(httpStatus.BAD_REQUEST).send({error:"There is no user this id!"});
        }
        userService.delete(req.params.id).then(deletedUser => {
            if (!deletedUser){
                res.status(httpStatus.NOT_FOUND).send({error:"This user not found!"});
            }
            res.status(httpStatus.OK).send({message:"Deleted has successfully"});
        }).catch(e => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred deleting!"});
        });
    }

    updateProfImage(req,res){
        //1- image control
        if (!req.files?.profile_image){
            res.status(httpStatus.BAD_REQUEST).send({error:"You have not enough data for this process!"});
        }
        const extansion = path.extname(req.files.profile_image.name);
        const fileName = `${req?.user._id}${extansion}`;
        const folderPath = path.join(__dirname,"../","uploads/users",fileName);

        req.files.profile_image.mv(folderPath,function(err){
            if(err) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:err});
            console.log("Image uploaded has been successfully");
            userService.update(req.user._id,{profile_image:fileName}).then(uploaded => {
                res.status(httpStatus.OK).send({message:"Image uploaded successfully!"})
            }).catch(()=>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred during uploading image!"})
            });
        });
        //2- upload process
        //3- DB save process
        //4- responses

    }
}

module.exports = new User();