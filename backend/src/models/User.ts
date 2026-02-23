import mongoose , { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
    username: {type : String, required: true, unique: true},
    password: {type : String, required: true},
}, { timestamps: true });

UserSchema.pre('save' , async function (){
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,10);
});

export default mongoose.model('User', UserSchema);