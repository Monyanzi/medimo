import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Heart, Phone, Pill, User, Droplets, Calendar, FileText } from 'lucide-react';

interface EmergencyData {
  n: string;  // name
  d: string;  // dob
  b: string;  // blood type
  a: string;  // allergies (comma-separated)
  e: string;  // emergency contact name
  ep: string; // emergency contact phone
  er: string; // emergency contact relationship
  c: string;  // conditions (comma-separated)
  m: string;  // medications (comma-separated)
  nt: string; // notes
  g: string;  // generated timestamp
}

const EmergencyViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<EmergencyData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const encoded = searchParams.get('d');
      if (encoded) {
        const decoded = JSON.parse(atob(encoded));
        setData(decoded);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, [searchParams]);

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-700">Invalid Emergency Card</h1>
          <p className="text-red-600 mt-2">This QR code may be expired or invalid.</p>
        </div>
      </div>
    );
  }

  const allergies = data.a ? data.a.split(',').filter(Boolean) : [];
  const conditions = data.c ? data.c.split(',').filter(Boolean) : [];
  const medications = data.m ? data.m.split(',').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Medical Emergency Card</span>
        </div>
        <h1 className="text-2xl font-bold">{data.n}</h1>
        {data.d && (
          <p className="text-red-100 text-sm mt-1">DOB: {data.d}</p>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Blood Type - Prominent */}
        {data.b && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <Droplets className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase">Blood Type</span>
            </div>
            <p className="text-3xl font-bold text-red-700 mt-1">{data.b}</p>
          </div>
        )}

        {/* Allergies - Critical Warning */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-bold uppercase">Allergies</span>
          </div>
          {allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, i) => (
                <span key={i} className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                  ⚠️ {allergy.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-amber-600">No known allergies</p>
          )}
        </div>

        {/* Emergency Contact - Clickable */}
        {data.e && (
          <a
            href={data.ep ? `tel:${data.ep.replace(/\D/g, '')}` : undefined}
            className="block bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 hover:bg-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Phone className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">Emergency Contact</span>
            </div>
            <p className="font-semibold text-emerald-800 text-lg">{data.e}</p>
            {data.er && <p className="text-emerald-600 text-sm">{data.er}</p>}
            {data.ep && (
              <p className="text-emerald-700 font-mono mt-1 text-lg">{data.ep}</p>
            )}
            {data.ep && (
              <p className="text-emerald-600 text-xs mt-2">Tap to call</p>
            )}
          </a>
        )}

        {/* Medical Conditions */}
        {conditions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase">Medical Conditions</span>
            </div>
            <ul className="space-y-1">
              {conditions.map((condition, i) => (
                <li key={i} className="text-blue-800">• {condition.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Medications */}
        {medications.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Pill className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase">Current Medications</span>
            </div>
            <ul className="space-y-1">
              {medications.map((med, i) => (
                <li key={i} className="text-purple-800">💊 {med.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Important Notes */}
        {data.nt && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">Important Notes</span>
            </div>
            <p className="text-orange-800">{data.nt}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 pb-8">
          <p>Generated: {data.g}</p>
          <p className="mt-1">Powered by Medimo</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyViewPage;
