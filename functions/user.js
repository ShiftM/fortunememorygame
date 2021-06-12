var time = require('../functions/time');
var axios = require('axios');
var crypto = require('crypto');
var qs = require('query-string');

const FORTUNE_API_HOST = process.env.FORTUNE_API_HOST;
const CHECKUSERGAME = process.env.CHECKUSERGAME;
const ADDCOINGAME = process.env.ADDCOINGAME;

const APIKEY = process.env.APIKEY;
const PRIVATEKEY = process.env.PRIVATEKEY;

const dotenv = require('dotenv');
dotenv.config();

function checkUserGame(token) {
    let apiHeader = {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(FORTUNE_API_HOST + CHECKUSERGAME, '', apiHeader)
            .then(res = (val) => {
                // Check return values
                if (val.data.is_user_exist && !val.data.is_blocked) {
                    resolve(val.data.sf_user_id)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
    })
}


function addCoinGame(payload) {
    let ref = Date.now()
    let apiRequest = {
        "reference_no": ref,
        "complete_level": parseInt(payload.complete_level)-1,
        "completed_time": time.getServerTime(),
        "securehash": generateHash({
            reference_no: ref, 
            coins_amount: payload.coins_amount
        }),
        "coins_amount": payload.coins_amount
    };
    let apiHeader = {
        headers: {
            'Authorization': 'Bearer ' + payload.token,
        }
    }
    console.log(apiRequest)

    return new Promise((resolve, reject) => {
        axios.post(FORTUNE_API_HOST + ADDCOINGAME, apiRequest, apiHeader)
            .then(res = (e) => {
                // LOG TO user_converted_stars_log      
                //  connection.query('INSERT INTO user_converted_stars_log (userId, amount, transactionId, dateCreated ) VALUES (?,?,?,?)',[ solution.ContactId, points, response.transactionID, getServerTime ()], function(error, results, fields){
                // 	if(error) throw error;
                // 	console.log("Successfully created log");  
                // });
                resolve(e.data)
            })
            .catch(error = (e) => {
                // LOG TO user_converted_stars_log      
                // connection.query('INSERT INTO user_converted_stars_log (userId, amount, transactionId, dateCreated ) VALUES (?,?,?,?)',[ solution.ContactId, points, 'Transaction Failed', getServerTime ()], function(error, results, fields){
                // 	if(error) throw error;
                // 	console.log("Successfully created log");  
                // });
                reject(e.data)
            });
    })

}
function generateHash(data) {
    str = APIKEY + ':' + data.reference_no + ':' + data.coins_amount + ':' + PRIVATEKEY
    var shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
}


module.exports = {
    checkUserGame: checkUserGame,
    addCoinGame: addCoinGame,
    generateHash
}
