const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const bcrypt = require("bcryptjs");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

/* GET USERS */
router.get("/", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  let query="SELECT id,name,email,role,station_access FROM users";
  let params=[];

  if(req.user.role==="admin"){
    query+=" WHERE station_access=?";
    params.push(req.user.station);
  }

  const [rows]=await db.query(query,params);
  res.json(rows);
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
router.put("/:id", verifyToken, allowRoles("admin","super_admin"), async (req,res)=>{
  const {role,station_access}=req.body;

  await db.query(
    "UPDATE users SET role=?, station_access=? WHERE id=?",
    [role,station_access,req.params.id]
  );

  res.json({message:"User updated"});
});

module.exports=router;