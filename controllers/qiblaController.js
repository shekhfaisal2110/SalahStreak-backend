import UserLocation from '../models/UserLocation.js';

// Helper: calculate Qibla direction from a point to Makkah (21.4225°N, 39.8262°E)
const getQiblaAngle = (lat, lon) => {
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;

  const makkahLat = 21.4225;
  const makkahLon = 39.8262;

  const phiK = toRad(makkahLat);
  const lambdaK = toRad(makkahLon);
  const phi = toRad(lat);
  const lambda = toRad(lon);

  const numerator = Math.sin(lambdaK - lambda);
  const denominator = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  let angle = toDeg(Math.atan2(numerator, denominator));
  angle = (angle + 360) % 360;
  return angle;
};

// Save user's current location (upsert)
export const saveUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;
    const userId = req.user._id;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    // Upsert: replace the last location for this user (keep only the latest)
    await UserLocation.findOneAndUpdate(
      { user: userId },
      { lat, lon, updatedAt: new Date() },
      { upsert: true, new: true, lean: true }
    );

    res.json({ success: true, message: 'Location saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's last saved location
export const getLastLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const location = await UserLocation.findOne({ user: userId }).sort({ updatedAt: -1 }).lean();
    if (!location) {
      return res.json({ success: true, location: null });
    }
    res.json({ success: true, location: { lat: location.lat, lon: location.lon } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Compute Qibla direction for given coordinates (or last saved)
export const getQiblaDirection = async (req, res) => {
  try {
    let { lat, lon } = req.query;
    const userId = req.user._id;

    if (!lat || !lon) {
      // Try to get last saved location
      const location = await UserLocation.findOne({ user: userId }).sort({ updatedAt: -1 }).lean();
      if (location) {
        lat = location.lat;
        lon = location.lon;
      } else {
        return res.status(400).json({ success: false, message: 'No location provided and no saved location found' });
      }
    }

    lat = parseFloat(lat);
    lon = parseFloat(lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const angle = getQiblaAngle(lat, lon);
    res.json({ success: true, qiblaAngle: angle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};