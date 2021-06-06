


function GetAbsoluteHKTime()
{
    var now = new Date();
    now.setUTCHours(now.getUTCHours() + 8);
    return {
        "year" : now.getUTCFullYear(),
        "month" : now.getUTCMonth(),
        "date" : now.getUTCDate(),
        "hour" : now.getUTCHours(),
        "minute" : now.getUTCMinutes(),
        "second" : now.getUTCSeconds()
    };
};

exports.getServerTime = () => {
	let date_ob = GetAbsoluteHKTime();
	let date = ("0" + date_ob.date).slice(-2);
	let month = ("0" + (date_ob.month + 1)).slice(-2);
	let year = date_ob.year;

	let hours = ('0' + date_ob.hour).slice(-2);
	let minutes = ('0' + date_ob.minute).slice(-2);
	let seconds = ('0' + date_ob.second).slice(-2);
	let formattedDate = year + "-" + month + "-" + date;
	let formattedTime = hours + ":" + minutes + ":" + seconds;

	return formattedDate + ' ' + formattedTime
}

exports.getServerDate = () => {
	let date_ob = GetAbsoluteHKTime();
	let date = ("0" + date_ob.date).slice(-2);
	let month = ("0" + (date_ob.month + 1)).slice(-2);
	let year = date_ob.year;
	let formattedDate = year + "-" + month + "-" + date;

	return formattedDate
}
