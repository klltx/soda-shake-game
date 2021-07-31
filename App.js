import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, Vibration, View } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';

const MIN_ENDPOINT = 200,
  MAX_ENDPOINT = 1200,
  SHAKE_BOTTLE = 'shakeBottle',
  OPEN_BOTTLE1 = 'openBottle1',
  OPEN_BOTTLE2 = 'openBottle2',
  END_GAME = 'endGame';

export default function App() {
  const [shakeSum, setShakeSum] = useState(0),
    [sumEndGame, setSumEndGame] = useState(getRandomInt(MIN_ENDPOINT, MAX_ENDPOINT)),
    [isEndGame, setIsEndGame] = useState(false);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, [shakeSum, isEndGame])

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const playSoundByTitle = async(soundTitle) => {
    const sound = new Audio.Sound();
    try {
      // await sound.loadAsync(require(`./assets/sounds/${soundTitle}.mp3`));
      await sound.loadAsync(require(`./assets/sounds/shakeBottle.mp3`));
      await sound.playAsync();
      // await sound.unloadAsync();
    } catch(error) { console.log(error) }
  }

  const setNewGame = () => {
    setIsEndGame(false);
    setShakeSum(0);
    setSumEndGame(getRandomInt(MIN_ENDPOINT, MAX_ENDPOINT));
  }

  const checkOnEndGame = (shakeSum, sumEndGame) => {
    if(shakeSum >= sumEndGame) {
      Vibration.vibrate();
      setIsEndGame(true);
    }
  }

  const _subscribe = () => {
    DeviceMotion.addListener((deviceMotionData) => {
      let y = Math.round(deviceMotionData.acceleration.y * 100) / 100;
      y = y < 0 ? -y : y;

      if(y > 10) playSoundByTitle(SHAKE_BOTTLE);
      
      let sum = Math.round(shakeSum + y);
      setShakeSum(sum);

      if(!isEndGame) checkOnEndGame(shakeSum, sumEndGame);
    })
  }

  const _unsubscribe = () => {
    DeviceMotion.removeAllListeners();
  }

  return (
    <View style={ styles.container }>
      <Text>sum: { shakeSum }</Text>
      <Text>end game: { sumEndGame }</Text>
      <StatusBar style="auto" />
      <View style={ styles.end }>
        <Button title='play again' onPress={ setNewGame } />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  end: {
    marginTop: 20,
    color: '#000',
    backgroundColor: '#000',
    width: '100%',
  }
});
