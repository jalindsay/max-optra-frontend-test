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

const generateInitialOrders = () => {
  let initialOrders = []
  for (let i = 1; i <= 5000; i++) {
    if (i % 100 === 0) {
      console.log(`generating order ${i}`)
    }
    // Using a random starting timestamp then set hour intervals for testing times
    let startTime1 = getRandomUnixTime(); // Random timestamp between now and 2 years ago
    let endTime1 = startTime1 + 3600; // 1 hour later
    let startTime2 = startTime1 + 18000; // 5 hours later
    let endTime2  = startTime2 + 3600; // 6 hours later

    let address = fakerator.address.street() + ", " + fakerator.address.postCode() + ", " + fakerator.address.country();

    let order = {
      id: i,
      name: `Test Order ${i} ${fakerator.names.lastName()}`,
      location: {
        name: `Test Location ${i} ${fakerator.address.city()}`,
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
  return initialOrders
}

const initialOrders = generateInitialOrders();

function App() {

  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleOrders, setVisibleOrders] = useState(10);
  const [startTimeFilter, setStartTimeFilter] = useState();
  const [endTimeFilter, setEndTimeFilter] = useState();

  const loadMoreOrders = () => {
    setVisibleOrders((prevVisibleOrders) => prevVisibleOrders + 10);
  };

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

  // TODO: format drop windows to only display ending time. (01/01/2020 10:00-11:00)
  // TODO: make card column fixed width
  // TODO: DatePicker state controll warning
  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
            label="Search Orders"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ marginBottom: 2, marginTop: 2 }}
        />
        <DatePicker
            label="Start Date"
            inputFormat="dd-mm-yyyy"
            value={startTimeFilter}
            onChange={(newValue) => setStartTimeFilter(newValue)}
            sx={{ marginBottom: 2 }}
        />
        <DatePicker
            label="End Date"
            value={endTimeFilter}
            onChange={(newValue) => setEndTimeFilter(newValue)}
            sx={{ marginBottom: 2 }}
        />
        { filteredOrders.slice(0, visibleOrders)?.map((order) => (
            <Box sx={{ minWidth: 275, marginBottom: 2  }} key={order.id}>
            <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div">{order.name}</Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">{order.location.name}</Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">{order.location.address}</Typography>
              <div>
                <Typography sx={{ mb: 1.5 }} color="text.primary">{new Date(order.dropWindows[0].startTime * 1000).toLocaleString()}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.primary">{new Date(order.dropWindows[0].endTime * 1000).toLocaleString()}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.primary">{new Date(order.dropWindows[1].startTime * 1000).toLocaleString()}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.primary">{new Date(order.dropWindows[1].endTime * 1000).toLocaleString()}</Typography>
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
