import './App.css';
import {useEffect, useState} from "react";
import {Box, Card, CardContent, Typography} from "@mui/material";

function App() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {

      // Generate a random date over the last two years
      const getRandomUnixTime = () => {
        return Math.floor((Math.random() * (1722474088 - 1659311997)) + 1659311997)
      };
      let initialOrders = []
      for (let i = 1; i <= 5000; i++) {
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
      setOrders(initialOrders);
    }, []);

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      { orders?.map((order) => (
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
