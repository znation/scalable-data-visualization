'use strict';

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var moment = require('moment');

// events from https://en.bitcoin.it/wiki/History
var events = [
  [new Date(2009, 0, 3), 'Genesis block established at 18:15:05 GMT'],
  [new Date(2009, 0, 9), 'Bitcoin v0.1 released and announced on the cryptography mailing list'],
  [new Date(2009, 0, 12), 'First Bitcoin transaction, in block 170 - from Satoshi to Hal Finney'],
  [new Date(2009, 9, 5), 'Exchange rates published by New Liberty Standard. $1 = 1,309.03 BTC'],
  [new Date(2009, 9, 9), '#bitcoin-dev channel registered on freenode IRC'],
  [new Date(2009, 11, 16), 'Bitcoin v0.2 released'],
  [new Date(2009, 11, 30), 'First difficulty increase at 06:11:04 GMT'],
  [new Date(2010, 1, 6), 'Bitcoin Market established'],
  [new Date(2010, 4, 22), 'laszlo first to buy pizza with Bitcoins agreeing upon paying 10,000 BTC for ~$25 worth of pizza courtesy of jercos'],
  [new Date(2010, 6, 7), 'Bitcoin v0.3 released'],
  [new Date(2010, 6, 11), 'Bitcoin v0.3 release mentioned on slashdot[5], bringing a large influx of new bitcoin users'],
  [new Date(2010, 6, 12), 'Beginning of a 10x increase in exchange value over a 5 day period, from about $0.008/BTC to $0.08/BTC'],
  [new Date(2010, 6, 17), 'MtGox established'],
  [new Date(2010, 6, 18), 'ArtForz generated his first block after establishing his personal OpenCL GPU hash farm'],
  [new Date(2010, 7, 15), 'Bug in the bitcoin code allows a bad transaction into block 74638. Users quickly adopt fixed code and the "good" block chain overtook the bad one at a block height of 74691, 53 blocks later'],
  [new Date(2010, 8, 14), 'jgarzik offered 10,000 BTC (valued at ~$600-650) to puddinpop to open source their windows-based CUDA client'],
  [new Date(2010, 8, 14), 'Block 79,764 is first to be mined using split allocation of the generation reward'],
  [new Date(2010, 8, 18), 'puddinpop released source to their windows-based CUDA client under MIT license'],
  [new Date(2010, 8, 29), 'kermit discovered a microtransactions exploit which precipitated the Bitcoin v0.3.13 release'],
  [new Date(2010, 9, 1), 'First public OpenCL miner released'],
  [new Date(2010, 9, 4), 'Original Bitcoin History wiki page (this page) established (ooh so meta) on Bitcoin.org\'s wiki'],
  [new Date(2010, 9, 7), 'Exchange rate started climbing up from $0.06/BTC after several flat months'],
  [new Date(2010, 9, 16), 'First recorded escrowed bitcoin trade conducted, between nanotube and Diablo-D3, escrowed by theymos'],
  [new Date(2010, 9, 17), '#bitcoin-otc trading channel established on freenode IRC'],
  [new Date(2010, 9, 28), 'First bitcoin short sale transaction initiated, with a loan of 100 BTC by nanotube to kiba, facilitated by the #bitcoin-otc market'],
  [new Date(2010, 10, 6), 'The Bitcoin economy passed US $1 million. The MtGox price touched USD $0.50/BTC'],
  [new Date(2010, 11, 7), 'Bitcoind was compiled for the Nokia N900 mobile computer by doublec. The following day, ribuck sent him 0.42 BTC in the first portable-to-portable Bitcoin transaction'],
  [new Date(2010, 11, 9), 'The generation difficulty passed 10,000'],
  [new Date(2010, 11, 9), 'First bitcoin call option contract sold, from nanotube to sgornick, via the #bitcoin-otc market'],
  [new Date(2010, 11, 16), 'Bitcoin Pooled Mining, operated by slush, found its first block']
];
events.reverse(); // will display backwards (newest on top)

module.exports = React.createClass({
  render: function() {
    return (
      <ul className="list-group">
        <ReactCSSTransitionGroup transitionName="history-events">
          {events.filter(function(evt) {
            return evt[0].getTime() <= this.props.now;
          }.bind(this)).map(function(evt) {
            var date = evt[0];
            var text = evt[1];
            return (
              <li className="list-group-item" key={text}>
                <span className="label label-primary">
                  {moment(date).calendar()}
                </span>
                <span>{text}</span>
              </li>
            );
          }.bind(this))}
        </ReactCSSTransitionGroup>
      </ul>
    );
  }
});
