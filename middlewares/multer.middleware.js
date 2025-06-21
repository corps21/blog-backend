import multer from 'multer';
import path from "path"
import { ApiError } from '../utils/index.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/temp'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + req?.user._id
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const limits = {
  fileSize: 31457280 // 30 mb
}

const fileFilter = (req,file,cb) => {
  if(file.mimetype.slice(0,5) !== 'image') {
    cb(new ApiError(400, "Only Image file is allowed"))
  } else cb(null, true)
}
const upload = multer({ storage, limits, fileFilter })

export {upload}

