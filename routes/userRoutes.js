const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

/* GET ALL USERS (admin & superadmin) */
router.get("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{
    const [rows]=await db.query(`
      SELECT id,name,email,role,station_access
      FROM users
      ORDER BY role DESC,name ASC
    `);
    res.json(rows);
  }catch(err){
    console.log(err);
    res.status(500).json({error:"Failed to fetch users"});
  }
});

/* CREATE USER */
router.post("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{
    const {name,email,password,role,station_access}=req.body;
    const bcrypt=require("bcryptjs");

    const hash=await bcrypt.hash(password,10);

    await db.query(
      "INSERT INTO users(name,email,password,role,station_access) VALUES(?,?,?,?,?)",
      [name,email,hash,role,station_access||null]
    );

    res.json({message:"User created"});
  }catch(err){
    if(err.code==="ER_DUP_ENTRY")
      return res.status(400).json({error:"Email already exists"});
    res.status(500).json({error:"Create failed"});
  }
});

module.exports=router;