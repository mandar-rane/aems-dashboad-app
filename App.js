import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';
import io from 'socket.io-client';
import { LineChart } from 'react-native-chart-kit';
import { Audio } from 'expo-av';

const screenWidth = Dimensions.get('window').width;

const App = () => {
  const [data, setData] = useState([0]);
  const [sound, setSound] = useState();
  const maxPts = 8;

  async function playSound(){
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/beep_sound.mp3'));
    setSound(sound);
    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound 
    ? () => {
      sound.unloadAsync();
    }
    :undefined;
  }, [sound]);

  useEffect(() => {

    const socket = io("http://192.168.31.25:3000", {transports: ['websocket']});

    socket.on('update_variable', (newData) => {
    
      if(newData==1){
        playSound();
      }
      
      
      setData((prevData) =>{
        const newDataArray = [...prevData, newData].slice(-maxPts);
        return newDataArray
      });
      console.log(`Recieved from server: ${data}`);
    });

    return () => socket.disconnect();

  }, []);


  return(
    <View >
      <View style={{flexDirection:"row", justifyContent:"center", marginTop: 20, marginBottom:20}}>
      <Text style={{fontSize: 16, fontStyle:"italic", fontWeight: "bold"}}>Real-Time Attention Score</Text>
      </View>
      
      <LineChart
      
        data={{
          labels: Array.from({length: data.length }, (_, i) => i.toString()),
          datasets: [
            {
              data
            },
          ],
        }}
        width= {screenWidth}
        height={250}
        yAxisLabel=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#3a3b3c',
        
          backgroundGradientFrom: '#3a3b3c',
          backgroundGradientTo: '#3a3b3c',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, 0.7)`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '5',
            stroke: '#ffffff',
          },
        }}
        bezier
        style={{

        borderWidth:2,
        borderColor: "#000000",
          borderRadius: 16
        }}
        
      
      />

      <View style={{marginTop:40, width: "100%", flexDirection: "column", alignItems:"center"}}>

        <Text style={{fontSize: 20,}}>Distraction Score : </Text>
        <Text style={{fontSize: 60}}>{data[data.length-1]}</Text>
      </View>


      
    </View>
  );

};



export default App;
