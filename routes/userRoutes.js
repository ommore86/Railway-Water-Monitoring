const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const bcrypt = require("bcryptjs");

const { verifyToken, allowRoles } = require("../middleware/authMiddleware");


// GET ALL USERS (admin & superadmin)
router.get("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{
    let query="SELECT id,name,email,role,station_access FROM users";

    // admin sees only his station users
    if(req.user.role==="admin")
      query+=" WHERE station_access=?";

    const [rows]=await db.query(query, req.user.role==="admin"?[req.user.station]:[]);
    res.json(rows);

  }catch(err){
    res.status(500).json({error:"Failed to fetch users"});
  }
});


// CREATE USER
router.post("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{
    const {name,email,password,role,station_access}=req.body;

    const hashed=await bcrypt.hash(password,10);

    await db.query(
      "INSERT INTO users(name,email,password,role,station_access) VALUES(?,?,?,?,?)",
      [name,email,hashed,role,station_access]
    );

    res.json({message:"User created"});

  }catch(err){
    console.error(err);
    res.status(500).json({error:"User creation failed"});
  }
});

module.exports=router;