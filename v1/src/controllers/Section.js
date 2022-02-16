const httpStatus = require("http-status");
const sectionService = require("../services/SectionService");


class Section{
    index(req,res){
        if(!req?.params?.project_id) return res.status(httpStatus.BAD_REQUEST).send({error:"Project info is missing!"});
        sectionService.list({project_id:req.params.project_id}).then(response => {
            res.status(httpStatus.OK).send(response)
        }).catch((e)=>{
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    }

    create(req,res){
        console.log("controller user",req.user);
        req.body.user_id = req.user;
        sectionService.create(req.body).then((response)=>{
            res.status(httpStatus.CREATED).send(response);
        })
            .catch((e)=>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
            })
    }

    update(req,res){
        if (!req.params.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message:"ID info is wrong!"
            });
        }
        sectionService.update(req.params.id,req.body).then(updatedDoc => {
            res.status(httpStatus.OK).send({message: "Updated has successfully"})
        })
            .catch(e =>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred registration!"})
            });
    }

    deleteSection(req,res){
        if (!req.params?.id){
            return res.status(httpStatus.BAD_REQUEST).send({error:"There is no section this id!"});
        }
        sectionService.delete(req.params.id).then(deletedSection => {
            if (!deletedSection){
                res.status(httpStatus.NOT_FOUND).send({error:"This section not found!"});
            }
            res.status(httpStatus.OK).send({message:"Deleted has successfully"});
        }).catch(e => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred deleting!"});
        });
    }
}


module.exports = new Section();