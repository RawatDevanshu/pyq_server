import Paper from "../models/paper.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { s3Uploadv2, s3Downloadv2, s3Deletev2 } from "../utils/s3Service.js";

const uploadPaper = asyncHandler(async (req, res) => {
  const uploadResult = await s3Uploadv2(req.file);
  const { subject, year, course, semester, term, owner } = req.body; // Assuming you're sending subject and year along with the upload

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

  res
    .status(200)
    .json(
      new ApiResponse(200, { uploadResult }, "Paper uploaded successfully"),
    );
});

const downloadPaper = asyncHandler(async (req, res) => {
  const downloadResult = await s3Downloadv2(req.query.name);

  res.set("Content-Type", "application/pdf");
  res.send(downloadResult.Body);
});

const deletePaper = asyncHandler(async (req, res) => {
  let delid = req.query.id;
  let delKey = req.query.key;

  const deleteResult = await s3Deletev2(delKey);
  let isDeleted = await Paper.findOneAndDelete({ _id: delid });

  if (isDeleted == null) {
    throw new ApiError(404, "Paper not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, isDeleted, "Paper deleted successfully"));
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
  res
    .status(200)
    .json(new ApiResponse(200, papers, "Papers fetched successfully"));
});

export { uploadPaper, downloadPaper, deletePaper, getPapers };
