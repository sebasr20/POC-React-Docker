import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';

const GestionViaje = ({ token }) => {
  const [startAddress, setStartAddress] = useState(''); // Primera dirección
  const [endAddress, setEndAddress] = useState(''); // Segunda dirección
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null); // Guardar la distancia
  const [duration, setDuration] = useState(null); // Guardar el tiempo estimado de viaje
  const [cost, setCost] = useState(null); // Guardar el costo calculado
  const [trabajadores, setTrabajadores] = useState([]);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyAzrNn2lAAuHrShSrdEh8JhzoJbzOrD4wY',
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -33.03354, lng: -71.53326 }, // Coordenadas iniciales
        zoom: 10,
        mapId: 'fbc16c2e7af8ec20', // Reemplazar con tu Map ID
      });
      setMap(mapInstance);

      // Inicializar DirectionsRenderer para mostrar la ruta en el mapa
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer();
      directionsRendererInstance.setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
    }).catch(error => {
      console.error("Error al cargar Google Maps API:", error);
    });

    // Realizar la solicitud a la API de trabajadores
    fetchTrabajadores(token);
  }, [token]);

  const fetchTrabajadores = async (token) => { 
    console.log("Token enviado:", token);  
    let config ={
      method: 'get',
      url: 'https://ryqapis-4737d892896b.herokuapp.com/api/colaboradores/',
      headers:{
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      }
    }

    try {
      const response = await axios.request(config);
      setTrabajadores(response.data); // Guardar la lista de trabajadores en el estado
    } catch (error) {
      console.error('Error al obtener la lista de trabajadores:', error);
      setError('Error al obtener la lista de trabajadores. Verifique su token.');
    }
  };

  const handleFindRoute = async () => {
    if (!startAddress || !endAddress) {
      setError('Por favor, ingresa ambas direcciones.');
      return;
    }

    try {
      // Geocodificar la primera dirección (origen)
      const originRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(startAddress)}&key=AIzaSyAzrNn2lAAuHrShSrdEh8JhzoJbzOrD4wY`
      );
      
      // Geocodificar la segunda dirección (destino)
      const destinationRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endAddress)}&key=AIzaSyAzrNn2lAAuHrShSrdEh8JhzoJbzOrD4wY`
      );

      if (originRes.data.status === 'OK' && destinationRes.data.status === 'OK') {
        const origin = originRes.data.results[0].geometry.location;
        const destination = destinationRes.data.results[0].geometry.location;

        // Configurar DirectionsService para obtener la ruta entre los puntos
        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
          {
            origin: new window.google.maps.LatLng(origin.lat, origin.lng),
            destination: new window.google.maps.LatLng(destination.lat, destination.lng),
            travelMode: window.google.maps.TravelMode.DRIVING, // Puedes cambiar el modo de transporte
          },
          (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);

              // Obtener la distancia de la ruta calculada
              const route = result.routes[0];
              const leg = route.legs[0]; // El primer tramo de la ruta
              setDistance(leg.distance.text); // Guardar la distancia en texto (por ejemplo: "8.6 km")
              setDuration(leg.duration.text); // Guardar el tiempo estimado (por ejemplo: "15 mins")

              // Calcular el costo basado en la distancia en kilómetros
              const distanceInKm = leg.distance.value / 1000; // Convertir metros a kilómetros
              const cost = distanceInKm * 640; // Costo por kilómetro
              setCost(cost.toFixed(2)); // Redondear a dos decimales

              setError(null);
            } else {
              setError('No se pudo encontrar una ruta entre los puntos.');
            }
          }
        );
      } else {
        setError('No se pudo geocodificar una de las direcciones.');
      }
    } catch (error) {
      setError('Error al conectar con la API.');
    }
  };

  return (
    <div>
      <h3>Selecciona un Colaborador</h3>
      <select onChange={(e) => setSelectedTrabajador(e.target.value)}>
        <option value="">Selecciona un Colaborador</option>
        {trabajadores.map((trabajador) => (
          <option key={trabajador.id} value={trabajador.id}>
            {trabajador.nombre} {trabajador.apellido}
          </option>
        ))}
      </select>

      {selectedTrabajador && <p>Trabajador seleccionado: {selectedTrabajador}</p>}
      <input
        type="text"
        value={startAddress}
        onChange={(e) => setStartAddress(e.target.value)}
        placeholder="Dirección de origen"
      />
      <input
        type="text"
        value={endAddress}
        onChange={(e) => setEndAddress(e.target.value)}
        placeholder="Dirección de destino"
      />
      <button onClick={handleFindRoute}>Mostrar Ruta</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {distance && <p>Distancia: {distance}</p>} {/* Mostrar la distancia */}
      {duration && <p>Tiempo estimado de viaje: {duration}</p>}
      {cost && <p>Costo estimado del viaje: ${cost} pesos</p>}
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default GestionViaje;
