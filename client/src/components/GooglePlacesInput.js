import React, { useState, useEffect, useRef, useCallback } from 'react';

const GooglePlacesInput = ({ onPlaceSelected, placeholder, style, value, onChange, name, required }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const serviceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const dummyDivRef = useRef(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps?.places) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
      // PlacesService needs a DOM element or map
      if (!dummyDivRef.current) {
        dummyDivRef.current = document.createElement('div');
      }
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDivRef.current);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input) => {
    if (!serviceRef.current || !input || input.length < 3) {
      setSuggestions([]);
      return;
    }
    serviceRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: 'us' } },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(e.target.value), 300);
  };

  const handleSelect = (prediction) => {
    // Immediately set the description as the value
    onChange({ target: { name, value: prediction.description } });
    setShowDropdown(false);
    setSuggestions([]);

    // Fetch full place details
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: prediction.place_id, fields: ['address_components', 'formatted_address'] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const components = {};
            if (place.address_components) {
              place.address_components.forEach((comp) => {
                comp.types.forEach((type) => {
                  components[type] = comp.long_name;
                  if (type === 'administrative_area_level_1') {
                    components.state_short = comp.short_name;
                  }
                });
              });
            }
            const formatted = place.formatted_address || prediction.description;
            onChange({ target: { name, value: formatted } });
            onPlaceSelected({
              formatted,
              street: `${components.street_number || ''} ${components.route || ''}`.trim(),
              city: components.locality || components.sublocality_level_1 || '',
              state: components.state_short || components.administrative_area_level_1 || '',
              zip: components.postal_code || '',
              country: components.country || '',
              components,
            });
          } else {
            // Fallback: use the prediction description
            onPlaceSelected({ formatted: prediction.description });
          }
        }
      );
    } else {
      onPlaceSelected({ formatted: prediction.description });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        placeholder={placeholder}
        style={style}
        required={required}
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul style={dropdownStyle}>
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              style={suggestionStyle}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f0e6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
            >
              <span style={{ marginRight: '8px', color: '#d4a843' }}>📍</span>
              {s.description}
            </li>
          ))}
          <li style={poweredByStyle}>
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  );
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  border: '2px solid #e0e0e0',
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  zIndex: 1000,
  maxHeight: '250px',
  overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const suggestionStyle = {
  padding: '10px 14px',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#2c2c2c',
  borderBottom: '1px solid #f0f0f0',
  transition: 'background-color 0.15s',
};

const poweredByStyle = {
  padding: '6px 14px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.7rem',
  color: '#999',
  textAlign: 'right',
  backgroundColor: '#fafafa',
};

export default GooglePlacesInput;
