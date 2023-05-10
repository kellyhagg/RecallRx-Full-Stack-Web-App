const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    user_type: {
        type: String,
    }
    // "todos": [
    //     // {
    //         // "name": String,
    //         // "done": {
    //             // type: Boolean,
    //             default: false
    //         }
    //     }
    // ]
});

const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;