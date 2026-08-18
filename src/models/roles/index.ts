import mongoose from "mongoose";
import roleSchema from "./schema.js";

export default mongoose.model('Role', roleSchema)