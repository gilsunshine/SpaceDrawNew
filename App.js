import React from 'react'
import { PanResponder, Text, StyleSheet, TouchableOpacity, View, Button, Overlay } from 'react-native'
import * as THREE from 'three'
import Expo, { Accelerometer } from 'expo'
import ExpoTHREE from 'expo-three'
import Ar from './AR.js'
import AccelerometerSensor from './AccelerometerSensor.js'
import GyroscopeSensor from './GyroscopeSensor.js'

console.disableYellowBox = true

export default class App extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      accelerometerData: null,
      gyroscopeData: null,
      showAr: false,
      color: {r: 255, g: 0, b: 0},
      display: 'hidden',
      scene: null
    }
  }

  setAccData = (data) => {
    this.setState({accelerometerData: data})
  }

  setGyroData = (data) => {
    this.setState({gyroscopeData: data})
  }

  showAr = () => {
    this.setState({showAr: !this.state.showAr})
  }

  setColor = (color) => {
    let h = this.mapThis(color.h, 0, 359, 0, 1)
    let s = color.s
    let v = color.v
    let newColor = this.HSVtoRGB(h, s, v)
    this.setState({color: newColor})
  }


  HSVtoRGB = (h, s, v) => {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  mapThis = (num, inMin, inMax, outMin, outMax) => {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  addScene = (scene) => {
    this.setState({scene: scene})
    console.log(this.state.scene)
  }


  render() {
    return (
      <View style={styles.container}>
        <Ar gyroscopeData={this.state.gyroscopeData} accelerometerData={this.state.accelerometerData} showAr={this.showAr}/>
        <AccelerometerSensor setAccData={this.setAccData}/>
        <GyroscopeSensor setGyroData={this.setGyroData}/>
      </View>
    )
  }
  // render() {
  //   return (
  //     <View style={styles.container}>
  //       {this.state.showAr ? <Ar style={{display: this.state.display}}  gyroscopeData={this.state.gyroscopeData} accelerometerData={this.state.accelerometerData} showAr={this.showAr}/> : <SettingsPage showAr={this.showAr} setColor={this.setColor}/>}
  //         <AccelerometerSensor setAccData={this.setAccData}/>
  //         <GyroscopeSensor setGyroData={this.setGyroData}/>
  //     </View>
  //   )
  // }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'
   },
  button: {
    alignItems: 'center',
    padding: 20,

  }
})
