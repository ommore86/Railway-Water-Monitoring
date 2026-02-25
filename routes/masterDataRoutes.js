const express=require("express");
const router=express.Router();
const db=require("../config/mysql");
const {verifyToken,allowRoles}=require("../middleware/authMiddleware");

/* ADD TRAIN */
router.post("/train",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  try{
    const {train_number,train_name}=req.body;
    await db.query(
      "INSERT INTO trains(train_number,train_name) VALUES(?,?)",
      [train_number,train_name]
    );
    res.json({message:"Train added"});
  }catch(err){
    if(err.code==="ER_DUP_ENTRY")
      return res.status(400).json({error:"Train already exists"});
    res.status(500).json({error:"Failed"});
  }
});

/* ADD STATION */
router.post("/station",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  try{
    const {station_number,station_name}=req.body;
    await db.query(
      "INSERT INTO stations(station_number,station_name) VALUES(?,?)",
      [station_number,station_name]
    );
    res.json({message:"Station added"});
  }catch(err){
    if(err.code==="ER_DUP_ENTRY")
      return res.status(400).json({error:"Station already exists"});
    res.status(500).json({error:"Failed"});
  }
});

module.exports=router;