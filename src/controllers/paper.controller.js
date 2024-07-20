import Paper from "../models/paper.js";

const uploadPaper = asyncHandler(async (req, res) => {
  const uploadResult = await s3Uploadv2(req.file);
  const { subject, year, course, semester, term, owner } = req.body; // Assuming you're sending subject and year along with the upload
  console.log(uploadResult.Location);
  // Create a new paper document in MongoDB
  const newPaper = new Paper({
    subject,
    year,
    course,
    semester,
    term,
    file: uploadResult.Key, // Store the file path in the database
    owner: owner,
  });

  await newPaper.save();
  paperId = newPaper.file;

  console.log(paperId);

  res
    .status(200)
    .json({ message: "Paper uploaded successfully", uploadResult });
});

const downloadPaper = asyncHandler(async (req, res) => {
  const downloadResult = await s3Downloadv2(req.query.name);
  console.log(downloadResult.ContentType);
  res.set("Content-Type", "application/pdf");
  res.send(downloadResult.Body);
});

const deletePaper = asyncHandler(async (req, res) => {
  let delid = req.query.id;
  let delKey = req.query.key;

  const deleteResult = await s3Deletev2(delKey);
  let resVal = await Paper.findOneAndDelete({ _id: delid });
  if (resVal == null) {
    res.send("No such record found");
  } else {
    console.log("DELETED");
    res.send(resVal);
  }
});

const getPapers = asyncHandler(async (req, res) => {
  const page = req.query.page || 0;
  const papersPerPage = 5;

  const search = req.query.search || "";
  const owner = req.query.owner || "";

  let sort = req.query.sort || "year";

  req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

  let sortBy = {};
  if (sort[1]) {
    sortBy[sort[0]] = sort[1];
  } else {
    sortBy[sort[0]] = "asc";
  }

  let re = new RegExp(search.length ? search : /(?:)/, "i");
  let ownerRE = new RegExp(owner.length ? owner : /[A-Za-z0-9]+/i);
  // console.log("Here is RE: -"+re+"- RE end")
  const papers = await Paper.find({
    $and: [
      { $or: [{ subject: re }, { course: re }, { term: re }] },
      { owner: ownerRE },
    ],
  })
    .sort(sortBy)
    .skip(page * papersPerPage)
    .limit(papersPerPage);
  papers.forEach((paper) => {
    paper.file.replace(/\\/g, "/");
  });
  res.status(200).json(papers);
});

export { uploadPaper, downloadPaper, deletePaper, getPapers };
