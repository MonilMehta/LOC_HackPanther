import React, { useEffect, useRef, useState } from 'react';
import { mappls } from "mappls-web-maps";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation2 } from 'lucide-react';

const PoliceMap = () => {
  const map = useRef(null);
  const mapplsClassObject = useRef(new mappls());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef([]);
  
  const POLICE_STATION_COORDS = [ 19.1031659,72.8327116];

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const addMarkerToMap = (map, lat, lng, title, description, isPoliceStation = false) => {
    const marker = mapplsClassObject.current.Marker({
      map: map,
      position: { lng, lat },
      popupHtml: `
        <div class='p-2'>
          <h3 class='font-bold'>${title}</h3>
          <p>${description}</p>
          <p>Click to navigate</p>
        </div>
      `,
      icon: isPoliceStation 
        ? "https://apis.mapmyindia.com/map_v3/1.png"
        : "https://apis.mapmyindia.com/map_v3/2.png",
      iconSize: [30, 30],
      draggable: false,
      clusterable: true
    });

    marker.addListener('click', () => {
      openInGoogleMaps(lat, lng);
    });

    return marker;
  };

  const fetchAndDisplayLocations = async (map) => {
    try {
      const response = await fetch('http://localhost:8000/api/case/getCaseLocation');
      const data = await response.json();
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add police station marker
      const policeStationMarker = addMarkerToMap(
        map,
        POLICE_STATION_COORDS[1],
        POLICE_STATION_COORDS[0],
        "Vile Parle Police Station",
        "Main police station",
        true
      );
      markersRef.current.push(policeStationMarker);

      // Add case location markers
      data.data
        .filter(caseData => caseData.location?.latitude && caseData.location?.longtitude)
        .forEach(caseData => {
          const lat = parseFloat(caseData.location.latitude);
          const lng = parseFloat(caseData.location.longtitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = addMarkerToMap(
              map,
              lat,
              lng,
              `Case #${caseData.caseNo}`,
              `${caseData.location.street}, ${caseData.location.city}`
            );
            markersRef.current.push(marker);
          }
        });

      // Fit bounds to show all markers
      const bounds = markersRef.current.reduce((bounds, marker) => {
        const position = marker.getPosition();
        bounds.extend(position);
        return bounds;
      }, mapplsClassObject.current.LatLngBounds());

      map.fitBounds(bounds, { padding: 50 });

    } catch (error) {
      console.error('Error fetching case locations:', error);
    }
  };

  useEffect(() => {
    // Initialize Mappls map
    mapplsClassObject.current.initialize("b65619a141c17442f6e7bf3ffeac9c39", { map: true }, () => {
      if (map.current) {
        map.current.remove();
      }

      // Create map instance
      map.current = mapplsClassObject.current.Map({
        id: "map",
        properties: {
          center: POLICE_STATION_COORDS,
          zoom: 12
        }
      });

      // Set map loaded state and add markers
      map.current.on("load", () => {
        setIsMapLoaded(true);
        fetchAndDisplayLocations(map.current);
      });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        markersRef.current.forEach(marker => marker.remove());
        map.current.remove();
      }
    };
  }, []);

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