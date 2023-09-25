const {S3} = require("aws-sdk");
const uuid = require("uuid").v4;

exports.s3Uploadv2 = async (file) => {
    const s3 = new S3();

    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uuid()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: "application/pdf",
    };
    const result = await s3.upload(param).promise();
    return result;
};

exports.s3Downloadv2 = async(fileName) => {
    const s3 = new S3();
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileName}`,
        ResponseContentType: "application/pdf",
      };
      
    const result = await s3.getObject(params).promise();
    return result;
}