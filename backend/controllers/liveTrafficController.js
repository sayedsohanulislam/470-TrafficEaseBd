const { buildLiveTrafficState, featureModules } = require('../data/liveTrafficData');

exports.getLiveTraffic = (req, res) => {
  res.json(buildLiveTrafficState());
};

exports.getFeatureModules = (req, res) => {
  res.json({
    count: featureModules.length,
    items: featureModules
  });
};
