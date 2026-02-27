const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const bcrypt = require("bcryptjs");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

/* GET USERS */
router.get("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{
    const [rows] = await db.query(
      "SELECT id,name,email,role,station_access FROM users ORDER BY id DESC"
    );

    res.json(rows);

  }catch(err){
    console.error(err);
    res.status(500).json({error:"Failed to fetch users"});
  }
});


/* CREATE USER */
router.post("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  const {name,email,password,role,station_access}=req.body;
  const hashed=await bcrypt.hash(password,10);

  await db.query(
    "INSERT INTO users(name,email,password,role,station_access) VALUES(?,?,?,?,?)",
    [name,email,hashed,role,station_access]
  );

  res.json({message:"User created"});
});


/* UPDATE USER */
/* UPDATE USER BY EMAIL */
router.put("/by-email", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  try{

    const {email,name,role,station_access}=req.body;

    if(!email)
      return res.status(400).json({error:"Email required"});

    const [result] = await db.query(
      "UPDATE users SET name=?, role=?, station_access=? WHERE email=?",
      [name,role,station_access,email]
    );

    if(result.affectedRows===0)
      return res.status(404).json({error:"User not found"});

    res.json({message:"User updated successfully"});

  }catch(err){
    console.error(err);
    res.status(500).json({error:"Update failed"});
  }
});

module.exports=router;