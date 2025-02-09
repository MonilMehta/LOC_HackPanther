import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const accessKeyId = `${import.meta.env.VITE_AWS_ACCESS_KEY}`
const secretAccessKey = `${import.meta.env.VITE_AWS_SECRET_KEY}`
let credentials = {
  accessKeyId,
  secretAccessKey,
};
const folder = "loc7";
const region = "eu-north-1";
const bucket = "milanh";
const client = new S3Client({
  region: region,
  credentials: credentials,
});


const AWSHelper = {
    upload: async function(file, userName) {
        try {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const fileContent = await file.arrayBuffer();
        const mimeType = file.type;
        console.log({ fileName,fileContent, mimeType})
        console.log('Uploading video');

        const uploadParams = {
            Bucket: bucket,
            Key: `${folder}/${userName}/${fileName}`,
            Body: fileContent,
            ContentType: mimeType,
        };

        const response = await client.send(new PutObjectCommand(uploadParams));
        console.log('AWS response: ', JSON.stringify(response));

        const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${folder}/${userName}/${fileName}`;
        console.log(fileUrl);
        return fileUrl;
        } catch (error) {
        console.log(error);
        return 'https://developers.google.com/static/maps/documentation/maps-static/images/error-image-generic.png';
        }
    },
};
  

export default AWSHelper;