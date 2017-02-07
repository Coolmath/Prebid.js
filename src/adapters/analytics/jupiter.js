
/**
 * jupiter.js - header bidding analytics with Jupiter Analytics
 */
let events = require('./../../events');
let utils = require('./../../utils');
let CONSTANTS = require('./../../constants.json');

let BID_REQUESTED = CONSTANTS.EVENTS.BID_REQUESTED;
let BID_TIMEOUT = CONSTANTS.EVENTS.BID_TIMEOUT;
let BID_RESPONSE = CONSTANTS.EVENTS.BID_RESPONSE;
let BID_WON = CONSTANTS.EVENTS.BID_WON;

/**
 * This will enable sending data to google analytics. Only call once, or duplicate data will be sent!
 * @param  {object} provider use to set GA global (if renamed);
 * @param  {object} options use to configure adapter;
 * @return {[type]}    [description]
 */
exports.enableAnalytics = function () {
    //set this function to return log message, prevents multiple adapter listeners
    this.enableAnalytics = function _enable() {
        return utils.logMessage(`Jupiter Analytics adapter already enabled, unnecessary call to \`enableAnalytics\`.`);
    };

    let bid = null;

    //first send all events fired before enableAnalytics called

    let existingEvents = events.getEvents();
    utils._each(existingEvents, function (eventObj) {
        let args = eventObj.args;
        if (!eventObj) {
            return;
        }

        if (eventObj.eventType === BID_REQUESTED) {
            bid = args;
            sendBidRequestToJupiter(bid);
        } else if (eventObj.eventType === BID_RESPONSE) {
            //bid is 2nd args
            bid = args;
            sendBidResponseToJupiter(bid);

        } else if (eventObj.eventType === BID_TIMEOUT) {
            const bidderArray = args;
            sendBidTimeoutsToJupiter(bidderArray);
        } else if (eventObj.eventType === BID_WON) {
            bid = args;
            sendBidWonToJupiter(bid);
        }
    });

    //Next register event listeners to send data immediately

    //bidRequests
    events.on(BID_REQUESTED, function (bidRequestObj) {
        sendBidRequestToJupiter(bidRequestObj);
    });

    //bidResponses
    events.on(BID_RESPONSE, function (bid) {
        sendBidResponseToJupiter(bid);
    });

    //bidTimeouts
    events.on(BID_TIMEOUT, function (bidderArray) {
        sendBidTimeoutsToJupiter(bidderArray);
    });

    //wins
    events.on(BID_WON, function (bid) {
        sendBidWonToJupiter(bid);
    });
};

function sendBidRequestToJupiter(bid) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://in.jupiter.coolmath.net/bids.php?action=request&bidderCode=' + bid.bidderCode +
        "&units=" + bid.bids.length +
        "&request=" + bid.requestId);
    xhr.send(null);
}

function sendBidResponseToJupiter(bid) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://in.jupiter.coolmath.net/bids.php?action=response&bidderCode=' + bid.bidderCode +
        '&time=' + bid.timeToRespond +
        '&cpm=' + bid.cpm +
        "&unit=" + bid.adUnitCode +
        "&request=" + bid.requestId);
    xhr.send(null);
}

function sendBidTimeoutsToJupiter(bidders) {
    utils.each(bidders, function(bid) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://in.jupiter.coolmath.net/bids.php?action=timeout&bidderCode=' + bid.bidderCode +
            "&request=" + bid.requestId);
        xhr.send(null);
    });
}
function sendBidWonToJupiter(bid) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://in.jupiter.coolmath.net/bids.php?action=won&bidderCode=' + bid.bidderCode + "&cpm=" + bid.cpm +
        "&unit=" + bid.adUnitCode +
        "&request=" + bid.requestId);
    xhr.send(null);
}
