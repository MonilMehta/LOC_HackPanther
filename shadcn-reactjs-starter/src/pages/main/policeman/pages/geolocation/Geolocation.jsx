import React, { useEffect, useRef, useState } from 'react';
import { mappls } from "mappls-web-maps";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation2 } from 'lucide-react';

const PoliceMap = () => {
  const map = useRef(null);
  const mapplsClassObject = useRef(new mappls());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [locations, setLocations] = useState(null);
  
  const policeStation = {
    type: "Feature",
    properties: {
      type: "police_station",
      title: "Vile Parle Police Station",
      description: "Main police station",
      icon: "https://apis.mapmyindia.com/map_v3/1.png",
      "icon-size": 0.75,
      "icon-offset": [0, -10],
      popupHtml: `
        <div class='p-2'>
          <h3 class='font-bold'>Vile Parle Police Station</h3>
          <p>Click to navigate</p>
        </div>
      `
    },
    geometry: {
      type: "Point",
      coordinates: [72.8327116, 19.1031659] // Longitude, Latitude
    }
  };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const fetchCaseLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/case/getCaseLocation');
      const data = await response.json();
      console.log('Case locations:', data);
      
      // Transform case data to GeoJSON format
      const caseFeatures = data.data
        .filter(caseData => caseData.coordinates && caseData.coordinates.lat && caseData.coordinates.lon)
        .map(caseData => ({
          type: "Feature",
          properties: {
            type: "case_location",
            title: `Case #${caseData.caseNo}`,
            description: `${caseData.location.street}, ${caseData.location.city}`,
            icon: "https://apis.mapmyindia.com/map_v3/2.png",
            "icon-size": 0.75,
            "icon-offset": [0, -10],
            popupHtml: `
              <div class='p-2'>
                <h3 class='font-bold'>Case #${caseData.caseNo}</h3>
                <p>${caseData.location.street}, ${caseData.location.city}</p>
                <p>Click to navigate</p>
              </div>
            `
          },
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(caseData.coordinates.lon), // Longitude
              parseFloat(caseData.coordinates.lat)  // Latitude
            ]
          }
        }));

      // Combine police station and case locations
      return {
        type: "FeatureCollection",
        features: [policeStation, ...caseFeatures]
      };
    } catch (error) {
      console.error('Error fetching case locations:', error);
      return {
        type: "FeatureCollection",
        features: [policeStation]
      };
    }
  };

  useEffect(() => {
    // Initialize Mappls map
    mapplsClassObject.current.initialize("b65619a141c17442f6e7bf3ffeac9c39", { map: true }, () => {
      if (map.current) {
        map.current.remove();
      }

      // Create map instance centered on Vile Parle Police Station
      map.current = mapplsClassObject.current.Map({
        id: "map",
        properties: {
          center: [72.8327116, 19.1031659], // Longitude, Latitude
          zoom: 12
        }
      });

      // Set map loaded state
      map.current.on("load", () => {
        setIsMapLoaded(true);
      });
    });
  }, []);

  useEffect(() => {
    if (isMapLoaded) {
      // Fetch and add locations to map
      fetchCaseLocations().then(geoJsonData => {
        if (geoJsonData) {
          setLocations(geoJsonData);
          mapplsClassObject.current.addGeoJson({
            map: map.current,
            data: geoJsonData,
            fitbounds: true,
            cType: 0,
            popupOptions: {
              offset: { bottom: [0, -20] },
              closeButton: true
            },
            click: (e) => {
              const { coordinates } = e.geometry;
              openInGoogleMaps(coordinates[1], coordinates[0]); // Latitude, Longitude
            }
          });
        }
      });
    }
  }, [isMapLoaded]);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation2 className="h-5 w-5" />
            Police Cases Map
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Vile Parle Police Station
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" fill="red" />
              Case Locations
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          id="map" 
          className="w-full h-[600px] rounded-lg overflow-hidden border"
        />
      </CardContent>
    </Card>
  );
};

export default PoliceMap;