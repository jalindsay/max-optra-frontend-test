import './App.css';
import {useEffect, useState} from "react";
import {Box, Card, CardContent, Typography, TextField} from "@mui/material";

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
    let startTime1 = getRandomUnixTime();
    let endTime1 = getRandomUnixTime();
    let startTime2 = getRandomUnixTime();
    let endTime2 = getRandomUnixTime();
    let order = {
      id: i,
      name: `Test Order ${i}`,
      location: {
        name: `Test Location ${i}`,
        longitude: 0,
        latitude: 0,
        address: ""
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

  const filteredOrders = orders.filter(order =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
            label="Search Orders"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
