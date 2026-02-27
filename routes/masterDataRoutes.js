const express=require("express");
const router=express.Router();
const db=require("../config/mysql");
const {verifyToken,allowRoles}=require("../middleware/authMiddleware");

/* ADD TRAIN */
router.post("/train",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  const {train_number,train_name}=req.body;

  try{
    await db.query("INSERT INTO trains(train_number,train_name) VALUES(?,?)",[train_number,train_name]);
    res.json({message:"Train added"});
  }catch(err){
    res.status(400).json({error:"Train already exists"});
  }
});

/* UPDATE TRAIN */
router.put("/train/:number",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  const {train_name}=req.body;
  await db.query("UPDATE trains SET train_name=? WHERE train_number=?",[train_name,req.params.number]);
  res.json({message:"Train updated"});
});


/* ADD STATION */
router.post("/station",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  const {station_number,station_name}=req.body;

  try{
    await db.query("INSERT INTO stations(station_number,station_name) VALUES(?,?)",[station_number,station_name]);
    res.json({message:"Station added"});
  }catch{
    res.status(400).json({error:"Station already exists"});
  }
});

/* UPDATE STATION */
router.put("/station/:number",verifyToken,allowRoles("admin","super_admin"),async(req,res)=>{
  const {station_name}=req.body;
  await db.query("UPDATE stations SET station_name=? WHERE station_number=?",[station_name,req.params.number]);
  res.json({message:"Station updated"});
});

module.exports=router;