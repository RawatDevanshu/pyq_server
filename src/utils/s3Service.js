import dotenv from "dotenv";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

dotenv.config({ path: "./.env" });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: process.env.AWS_REGION,
});

const s3Uploadv2 = async (file) => {
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuid()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: "application/pdf",
  };
  const result = await s3.upload(param).promise();
  return result;
};

const s3Downloadv2 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${fileName}`,
    ResponseContentType: "application/pdf",
  };

  const result = await s3.getObject(params).promise();
  return result;
};

const s3Deletev2 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${fileName}`,
  };

  const result = await s3.deleteObject(params).promise();
  return result;
};

export { s3Uploadv2, s3Downloadv2, s3Deletev2 };
