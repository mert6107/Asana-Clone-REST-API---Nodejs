const httpStatus = require("http-status");
const projectService = require("../services/ProjectService");
const ApiError = require("../errors/ApiError");

class Project {
    index(req,res){
        projectService.list().then(response => {
            res.status(httpStatus.OK).send(response)
        }).catch((e)=>{
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    }

    create(req,res){
        req.body.user_id = req.user;
        projectService.create(req.body).then((response)=>{
            res.status(httpStatus.CREATED).send(response);
        })
            .catch((e)=>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
            })
    }

    update(req,res,next){
        if (!req.params.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message:"ID information is wrong!"
            });
        }
        projectService.update(req.params.id,req.body).then(updatedProject => {
            if(!updatedProject) return next(new ApiError("Böyle bir kayıt bulunmamaktadır",404));
            res.status(httpStatus.OK).send({message: "Updated has successfully"});
        })
            .catch(e =>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred registration!"})
            });
    };

    deleteProject(req,res){
        if (!req.params?.id){
            return res.status(httpStatus.BAD_REQUEST).send({error:"There is no project this id!"});
        }
        projectService.delete(req.params.id).then(deletedProject => {
            if (!deletedProject){
                res.status(httpStatus.NOT_FOUND).send({error:"This project not found!"});
            }
            res.status(httpStatus.OK).send({message:"Deleted has successfully"});
        }).catch(e => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred deleting!"});
        });
    };
}



module.exports = new Project();