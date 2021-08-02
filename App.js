import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, ImageBackground, Image, StyleSheet, Text, Vibration, View, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';

const MIN_ENDPOINT = 200,
  MAX_ENDPOINT = 1200,
  SHAKE_BOTTLE = 'shakeBottle',
  OPEN_BOTTLE1 = 'openBottle1',
  OPEN_BOTTLE2 = 'openBottle2',
  END_GAME = 'endGame',
  imageBottle = { uri: 'http://pngimg.com/uploads/sprite/sprite_PNG8919.png' },
  imageReplay = { uri: 'https://cdn.iconscout.com/icon/free/png-512/replay-20-470364.png' };

export default function App() {
  const [shakeSum, setShakeSum] = useState(0),
    [sumEndGame, setSumEndGame] = useState(getRandomInt(MIN_ENDPOINT, MAX_ENDPOINT)),
    [isEndGame, setIsEndGame] = useState(false);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  })

  useEffect(() => {
    checkOnEndGame(shakeSum, sumEndGame);
  }, [shakeSum])

  useKeepAwake();

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const playSoundShakeBottle = async() => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require(`./assets/sounds/shakeBottle2.wav`));
      await sound.playAsync();
    } catch(error) { console.log(error) }
  }

  const playSoundOpenBottle = async() => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require(`./assets/sounds/openBottle1.mp3`));
      await sound.playAsync();
    } catch(error) { console.log(error) }
  }

  const playSoundEndGame = async() => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require(`./assets/sounds/endGame.mp3`));
      await sound.playAsync();
    } catch(error) { console.log(error) }
  }

  const setNewGame = () => {
    setIsEndGame(false);
    setShakeSum(0);
    setSumEndGame(getRandomInt(MIN_ENDPOINT, MAX_ENDPOINT));
  }

  const checkOnEndGame = (shakeSum, sumEndGame) => {
    if(!isEndGame && (shakeSum >= sumEndGame)) {
      setIsEndGame(true);
      Vibration.vibrate();
      playSoundOpenBottle();
      playSoundEndGame();
    }
  }

  const _subscribe = () => {
    DeviceMotion.addListener((deviceMotionData) => {
      let y = Math.round(deviceMotionData.acceleration.y * 100) / 100;
      
      y = y < 0 ? -y : y;
      
      if(!isEndGame && y > 10) playSoundShakeBottle();

      let sum = Math.round(shakeSum + y);
      setShakeSum(sum);
    })
  }

  const _unsubscribe = () => {
    DeviceMotion.removeAllListeners();
  }

  return (
    <View style={ styles.container }>
      <ImageBackground source={ imageBottle } style={ styles.imageBG }></ImageBackground>
      <StatusBar style="auto" />

      <View style={ isEndGame ? styles.endBG : styles.hidden }></View>
      
      <View style={ isEndGame ? styles.endScreen : styles.hidden }>
        {/* <TouchableHighlight onPress={ setNewGame } underlayColor='#fff' >
          <Image style={ styles.replayLogo } source={ imageReplay } />
        </TouchableHighlight> */}
        <TouchableWithoutFeedback onPress={ setNewGame } >
          <Image style={ styles.replayLogo } source={ imageReplay } />
        </TouchableWithoutFeedback>
        {/* <Button title='play again' onPress={ setNewGame } /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBG: {
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
    opacity: 0.9,
  },
  hidden: {
    display: 'none',
  },
  imageBG: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
  },
  endScreen: {
    display: 'flex',
    position: 'absolute',
    opacity: 1,
    justifyContent: 'center',
    width: 150,
  },
  replayLogo: {
    width: 150,
    height: 150,
  },
});
