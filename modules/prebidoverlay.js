/**
 * prebidoverlay.js - prebidover adapter inspired with google analytics adapter
 */

var events = require('src/events');
var utils = require('src/utils');
var CONSTANTS = require('src/constants.json');
var adaptermanager = require('src/adaptermanager');

var BID_WON = CONSTANTS.EVENTS.BID_WON;

/**
 * This will enable sending data to google analytics. Only call once, or duplicate data will be sent!
 * @param  {object} provider use to set GA global (if renamed);
 * @param  {object} options use to configure adapter;
 * @return {[type]}    [description]
 */
exports.enableAnalytics = function () {
  // set this function to return log message, prevents multiple adapter listeners
  this.enableAnalytics = function _enable() {
    return utils.logMessage(`Prebid Overlay adapter already enabled, unnecessary call to \`enableAnalytics\`.`);
  };
  let bid = null;
  // first send all events fired before enableAnalytics called
  let existingEvents = events.getEvents();
  utils._each(existingEvents, function (eventObj) {
    let args = eventObj.args;
    if (!eventObj) {
      return;
    }
    if (eventObj.eventType === BID_WON) {
      bid = args;
      sendBidWonToPrebidOverlay(bid);
    }
  });
  // Next register event listeners to send data immediately wins
  events.on(BID_WON, function (bid) {
    sendBidWonToPrebidOverlay(bid);
  });
};

function sendBidWonToPrebidOverlay(bid) {
  jQuery('#' + bid.adUnitCode).before('<div style=\'color: #FF0 !important;position: relative;border: 1px solid #FF0;height: 20px;font-size:16px;vertical-align:middle;display:table-cell\'>' + bid.bidderCode + ' cpm: ' + bid.cpm + ' won</div>');
}

adaptermanager.registerAnalyticsAdapter({
  adapter: exports,
  code: 'prebidoverlay'
});
