require("dotenv").config();
const express = require('express');
const multer = require('multer');
const Paper = require('./models/paper')
const adminModel = require('./models/admin')
const mongoose = require('mongoose')
const path = require('path')
const { s3Uploadv2, s3Downloadv2 } = require("./s3Service");

const app = express();
app.use(express.json())

const connectDB = async()=>{
  try{
    const conn = await mongoose.connect('mongodb+srv://rawatdevanshu22:Rawat1718@cluster0.lgkokgf.mongodb.net/College',{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('MongoDB connected:')
  console.log( conn.connection.host)
  }catch(error){
  console.log(error)
  process.exit(1)
}

}

const db = mongoose.connection
db.on('error',console.error.bind(console, 'MongoDB connection error:'))
// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: 'uploads/', // Set your upload destination
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
const storage = multer.memoryStorage()

const upload = multer({ storage });

// Handle paper upload
app.post('/paper/upload',upload.single('paper'), async (req, res) => {
  try {
    const uploadResult = await s3Uploadv2(req.file);
    const { subject, year, course, semester, term , owner} = req.body; // Assuming you're sending subject and year along with the upload
    console.log(uploadResult.Location);
    // Create a new paper document in MongoDB
    const newPaper = new Paper({
      subject,
      year,
      course,
      semester,
      term,
      file: uploadResult.Key, // Store the file path in the database
      owner: owner
    });

    await newPaper.save();
    paperId = await newPaper.file;

    console.log(paperId);

    res.status(200).json({ message: 'Paper uploaded successfully',uploadResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading paper' });
  }
});

app.get('/paper', async (req,res)=> {
    
    const page = req.query.page || 0
    const papersPerPage = 5

    const search = req.query.search || ""
    const owner = req.query.owner || ""
    
    
    let sort = req.query.sort || "year"
        
        req.query.sort ? (sort = req.query.sort.split(",")): (sort = [sort])
        
        let sortBy = {}
        if(sort[1]){
            sortBy[sort[0]] = sort[1]
        }else{
            sortBy[sort[0]] = "asc"
        }
    
    let re = new RegExp(search.length?search:/(?:)/,"i")
    let ownerRE = new RegExp(owner.length?owner:/[A-Za-z0-9]+/i)
    // console.log("Here is RE: -"+re+"- RE end")
    const papers = await Paper
    .find({$and: [{$or: [{subject: re }, {course: re }, {term: re }]},{owner:ownerRE}]}).sort(sortBy).skip(page*papersPerPage).limit(papersPerPage)
    papers.forEach((paper)=>{paper.file.replace(/\\/g,'/')})
    res.status(200).json(papers)    
})

app.get('/paper/download',async (req,res)=>{
  const downloadResult = await s3Downloadv2(req.query.name);
  
  // var filePath = path.join('./',req.query.path.replaceAll('\\\\','/'))
  // console.log("Inside download API call:-")
  // console.log(filePath.replace('\\','/'))
  // res.setHeader("fileName",req.query.path.slice(8))

  console.log(downloadResult.ContentType)
  res.set('Content-Type', 'application/pdf')
  res.send(downloadResult.Body);
  // res.status(200).json({ message: 'done api call',downloadResult})
})

app.post('/admin/login',async (req,res)=>{
 
  const {adminId,password} = req.body
  await adminModel.findOne({"adminId":adminId})
  .then(user=>{
  console.log(user)
    if(user){if(user.password == password){
      res.json({message:"Success"})
    }else{
      res.json({message:"incorrect password"})
    }}else{
      res.json({message:"no such user"})
    }
  })
})

app.post('/register',(req,res)=>{
  adminModel.create(req.body).then(admin => res.json(admin)).catch(err=> res.json(err))
})

app.delete('/del/:id', async(req,res)=>{
  let delid = req.params.id;

  let resVal = await Paper.findOneAndDelete({_id:delid})  
  if(resVal == null){
    res.send("No such record found");
  }else{res.send(resVal)}
})

connectDB().then(()=>{app.listen(3000,"0.0.0.0", () => {
  console.log('Server started on port 3000');
});})