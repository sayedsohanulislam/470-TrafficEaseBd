const ParkingLot = require('../models/ParkingLot');

const buildPayload = (body) => {
  const payload = { ...body };
  if (Array.isArray(body.coordinates)) {
    payload.location = { type: 'Point', coordinates: body.coordinates.map(Number) };
  }
  return payload;
};

exports.getParkingLots = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const items = await ParkingLot.find(filter).sort({ availableSpaces: -1 }).limit(100);
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createParkingLot = async (req, res) => {
  try {
    const lot = await ParkingLot.create(buildPayload(req.body));
    res.status(201).json(lot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateParkingLot = async (req, res) => {
  try {
    const lot = await ParkingLot.findByIdAndUpdate(req.params.id, buildPayload(req.body), {
      new: true,
      runValidators: true
    });
    if (!lot) return res.status(404).json({ message: 'Parking lot not found' });
    return res.json(lot);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteParkingLot = async (req, res) => {
  try {
    const lot = await ParkingLot.findByIdAndDelete(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Parking lot not found' });
    return res.json({ message: 'Parking lot deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
