import './App.css';
import {useEffect, useState} from "react";
import { Box, Card, CardContent, Typography, TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Fakerator from 'fakerator';
let fakerator = Fakerator("en-GB");

// Generate a random unix time between now and the past 2 years
const getRandomUnixTime = () => {
  return Math.floor((Math.random() * (1722474088 - 1659311997)) + 1659311997)
};

// Generates all 5000 of the initial orders
// Uses the package 'fakerator' to generate random names and addresses
const generateInitialOrders = () => {
  let initialOrders = []
  for (let i = 1; i <= 5000; i++) {
    // Using a random starting timestamp then set hour intervals for testing times
    let startTime1 = getRandomUnixTime(); // Random timestamp between now and 2 years ago
    let endTime1 = startTime1 + 3600; // 1 hour later
    let startTime2 = startTime1 + 18000; // 5 hours later
    let endTime2  = startTime2 + 3600; // 6 hours later

    let address = fakerator.address.street() + ", " + fakerator.address.postCode() + ", " + fakerator.address.country();

    let order = {
      id: i,
      name: `Test Order ${i}: ${fakerator.names.lastName()}`,
      location: {
        name: `Test Location ${i}: ${fakerator.address.city()}`,
        longitude: fakerator.address.geoLocation().longitude,
        latitude: fakerator.address.geoLocation().longitude,
        address: address
      },
      dropWindows: [
        {
          startTime: startTime1,
          endTime: endTime1
        },
        {
          startTime: startTime2,
          endTime: endTime2
        }
      ]
    }
    initialOrders.push(order)
  }
  console.log('orders generated')
  return initialOrders
}

const initialOrders = generateInitialOrders();

// Main App component
// TODO: Add dedicated button to toggle time filter
function App() {

  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleOrders, setVisibleOrders] = useState(10);
  const [startTimeFilter, setStartTimeFilter] = useState();
  const [endTimeFilter, setEndTimeFilter] = useState();

  const loadMoreOrders = () => {
    setVisibleOrders((prevVisibleOrders) => prevVisibleOrders + 10);
  };

  // Checks if the user has scrolled to the bottom of the page
  // if so, load 10 more orders
  const handleScroll = () => {
    console.log('scrolling')
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
      console.log(`scrollTop: ${document.documentElement.scrollTop}, innerHeight: ${window.innerHeight}, offsetHeight: ${document.documentElement.offsetHeight}`)
      return;
    } else {
      console.log('loading more orders...')
      loadMoreOrders();
    };
  };

  // Addes event listener to window to check for scrolling
  // return fucntion removes event listener when component is unmounted
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredOrders = orders.filter(order => {
    const orderStartTime1 = order.dropWindows[0].startTime;
    const orderEndTime1 = order.dropWindows[0].endTime;
    const orderStartTime2 = order.dropWindows[1].startTime;
    const orderEndTime2 = order.dropWindows[1].endTime;

    const startTimeMatch = startTimeFilter ? (
        orderStartTime1 >= new Date(startTimeFilter).getTime() / 1000 ||
        orderEndTime1 >= new Date(startTimeFilter).getTime() / 1000 ||
        orderStartTime2 >= new Date(startTimeFilter).getTime() / 1000 ||
        orderEndTime2 >= new Date(startTimeFilter).getTime() / 1000
    ) : true;

    // Match end time. Add 86400 seconds to end time to match end of day
    const endTimeMatch = endTimeFilter ? (
        orderStartTime1 <= ((new Date(endTimeFilter).getTime() / 1000) + 86400) ||
        orderEndTime1 <= ((new Date(endTimeFilter).getTime() / 1000) + 86400) ||
        orderStartTime2 <= ((new Date(endTimeFilter).getTime() / 1000) + 86400) ||
        orderEndTime2 <= ((new Date(endTimeFilter).getTime() / 1000) + 86400)
    ) : true;

    return order.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        startTimeMatch &&
        endTimeMatch;
  });

  // TODO: DatePicker state controll warning
  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
        <TextField
            label="Search Orders"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ marginBottom: 2, marginTop: 2, width: '350px', marginLeft: 2}}
        />
        <DatePicker
            label="Start Date"
            value={startTimeFilter ?? null}
            onChange={(newValue) => setStartTimeFilter(newValue)}
            sx={{ marginBottom: 2, width: '350px', marginLeft: 2}}
        />
        <DatePicker
            label="End Date"
            value={endTimeFilter ?? null}
            onChange={(newValue) => setEndTimeFilter(newValue)}
            sx={{ marginBottom: 2, width: '350px', marginLeft: 2}}
        />
        { filteredOrders.slice(0, visibleOrders)?.map((order) => (
            <Box sx={{ minWidth: 275, marginBottom: 2, marginLeft: 2 }} key={order.id}>
            <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div" color={'blue'}>{order.name}</Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">{order.location.name}</Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">{order.location.address}</Typography>
              <div>
                <Typography sx={{ mb: 1.5 }} color="text.primary">
                  Drop Window 1: {new Date(order.dropWindows[0].startTime * 1000).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}-{new Date(order.dropWindows[0].endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.primary">
                  Drop Window 2: {new Date(order.dropWindows[1].startTime * 1000).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}-{new Date(order.dropWindows[0].endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </div>

            </CardContent>
            </Card>
            </Box>
        ))}
      </Box>
    </div>
  );
}

export default App;
