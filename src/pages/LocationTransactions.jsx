// src/pages/LocationTransactions.jsx

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Location from "../assets/location.png";
import FlirtyLocation from "../assets/flirtyLocation.png";
import togilo from "../assets/signupImage.png";
import flirtyVoice from "../assets/flirtyvoices.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLng, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { BaseUrl } from "../BaseUrl";

export default function LocationTransactions() {
  var L = window.L;

  var locIcon = L.icon({
    iconUrl: Location,
    iconSize: [30, 40],
  });
  var locIconFlirty = L.icon({
    iconUrl: FlirtyLocation,
    iconSize: [30, 40],
  });

  const navigate = useNavigate();
  const mapRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [groupBy, setGroupBy] = useState("city");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [bounds, setBounds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/get-transactions-by-location?date=${date}&groupBy=${groupBy}`,
      );

      const togiloData = (res.data?.data?.togiloData || []).map((item) => ({
        ...item,
        app: "togilo",
      }));

      const flirtyVoiceData = (res.data?.data?.flirtyVoiceData || []).map(
        (item) => ({
          ...item,
          app: "flirtyVoice",
        }),
      );

      const list = [...togiloData, ...flirtyVoiceData];

      setData(list);

      // Create bounds
      const coords = list
        .filter((item) => item.avgLatitude != null && item.avgLongitude != null)
        .map(
          (item) =>
            new LatLng(Number(item.avgLatitude), Number(item.avgLongitude)),
        );

      setBounds(coords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (!mapRef.current || bounds.length === 0) return;

    const leafletMap = mapRef.current;

    const leafletBounds = new LatLngBounds(bounds);

    // small delay ensures map is fully ready
    setTimeout(() => {
      leafletMap.fitBounds(leafletBounds);
    }, 500);
  }, [bounds]);
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <span
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full text-sm bg-rose-500/20 text-rose-300 cursor-pointer"
        >
          Back
        </span>

        <div>
          <h1 className="text-3xl font-black">Location Analytics</h1>
          <p className="text-slate-400 text-sm">Grouped by {groupBy}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <Calendar size={16} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2"
          >
            <option value="city">City</option>
            <option value="region">Region</option>
            <option value="country">Country</option>
          </select>

          <button
            onClick={fetchData}
            className="bg-indigo-600 px-5 py-2 rounded-xl"
          >
            Apply
          </button>
        </div>
      </div>

      {/* MAP */}
      {bounds.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-6 z-10 relative">
          <MapContainer
            bounds={bounds}
            boundsOptions={bounds}
            ref={mapRef}
            style={{ height: "420px" }}
            scrollWheelZoo
          >
            <TileLayer
              url="//{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={21}
              minZoom={4}
              minZoomIsDrawing={18}
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
            />

            {data.map((item, i) => {
              if (!item.avgLatitude || !item.avgLongitude) return null;

              return (
                <Marker
                  key={i}
                  icon={item.app === "togilo" ? locIcon : locIconFlirty}
                  position={[item.avgLatitude, item.avgLongitude]}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold text-indigo-600">
                        {item.location}
                      </div>
                      <div>💰 ₹ {item.totalAmount}</div>
                      <div>📦 {item.totalTransactions} txns</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* LOADER */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* CARDS (same UI kept) */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {data.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5"
            >
              <div
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="cursor-pointer"
              >
                <div className="flex justify-between">
                  <h2 className="font-bold">{item.location}</h2>
                  <span className="text-xs text-slate-400">
                    {item.totalTransactions} txns
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="text-green-400 mt-2">
                    ₹ {item.totalAmount}
                  </div>
                  <div>
                    <img
                      src={item.app === "togilo" ? togilo : flirtyVoice}
                      alt=""
                      className={`${item.app === "togilo" ? "h-6" : "h-8"} w-8`}
                    />
                  </div>
                </div>
              </div>

              {openIndex === index && (
                <div className="mt-3 space-y-2">
                  {item.users.map((u) => (
                    <div
                      key={u.userId}
                      className="flex justify-between text-sm bg-white/5 p-2 rounded"
                    >
                      <span>{u.name}</span>
                      <span>₹ {u.totalAmount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
