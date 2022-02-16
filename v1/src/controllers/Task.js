const httpStatus = require("http-status");
const taskService = require("../services/TaskService");

class Task {
    index(req,res){
        if(!req?.params?.project_id) return res.status(httpStatus.BAD_REQUEST).send({error:"Project info is missing!"});
        taskService.list({project_id:req.params.project_id}).then(response => {
            res.status(httpStatus.OK).send(response)
        }).catch((e)=>{
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    }

    create(req,res){
        console.log("controller user",req.user);
        req.body.user_id = req.user;
        taskService.create(req.body).then((response)=>{
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
        taskService.update(req.params.id,req.body).then(updatedDoc => {
            res.status(httpStatus.OK).send({message: "Updated has successfully"})
        })
            .catch(e =>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred registration!"})
            });
    }

    deleteTask(req,res){
        if (!req.params?.id){
            return res.status(httpStatus.BAD_REQUEST).send({error:"There is no section this id!"});
        }
        taskService.delete(req.params.id).then(deletedSection => {
            if (!deletedSection){
                res.status(httpStatus.NOT_FOUND).send({error:"This section not found!"});
            }
            res.status(httpStatus.OK).send({message:"Deleted has successfully"});
        }).catch(e => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"An error occurred deleting!"});
        });
    }

    makeComment(req,res){
        req.body.user_id = req.user;
        req.body.commented_at = new Date();
        console.log(req.params.id);
        taskService.findOne({_id : req.params.id}).then(mainTask=>{
            if (!mainTask) return res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});
            console.log("maintask",mainTask);
            const comment ={
                ...req.body,
                commented_at:new Date(),
                user_id: req.user,
            };
            mainTask.comments.push(comment);
            mainTask.save().then(updatedDoc => {
                return res.status(httpStatus.OK).send({message:"Comment adding successfully"});
            });
        }).catch(e=>{
            res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});
        });

    }

    deleteComment(req,res){
        req.body.user_id = req.user;
        req.body.commented_at = new Date();
        taskService.findOne({_id : req.params.id}).then(mainTask=>{
            if (!mainTask) return res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});
            mainTask.comments = mainTask.comments.filter((c) => c._id?.toString() !== req.params.commentId);
            mainTask.save().then(updatedDoc => {
                return res.status(httpStatus.OK).send({message:"Comment deleting successfully"});
            });
        }).catch(e=>{
            res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});
        });

    }

    addSubTask(req,res){
        if(!req.params.id) return res.status(httpStatus.BAD_REQUEST).send({error:"Id information required"});
        taskService.findOne({_id : req.params.id}).then(mainTask=>{
            if (!mainTask) return res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});

            req.body.user_id = req.user;
            taskService.create(req.body).then((subTask)=>{
                mainTask.sub_tasks.push(subTask);
                mainTask.save().then(updatedDoc => {
                    res.status(httpStatus.OK).send(updatedDoc);
                });
            }).catch((e)=>{
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
            })

        }).catch(e=>{
            res.status(httpStatus.BAD_REQUEST).send({error:"Dont pull your request!"});
        });
    }

    getSubtask(req,res){
        if(!req.params.id) return res.status(httpStatus.BAD_REQUEST).send({error:"Id information required"});
        taskService.findOne({_id:req.params.id},true).then(task =>{
            if (!task) return res.status(httpStatus.BAD_REQUEST).send({error:"Not Found!"});
            res.status(httpStatus.OK).send(task);
        });
    }
}


module.exports = new Task();