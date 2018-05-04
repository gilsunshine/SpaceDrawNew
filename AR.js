import ExpoTHREE, {THREE} from 'expo-three';
import React from 'react';
import { StyleSheet, Text, View, PanResponder, TouchableOpacity, CameraRoll} from 'react-native';
import { Card, Button, FormLabel, FormInput, Slider } from 'react-native-elements';
import UUID from 'uuid'
import Expo, { Constants, Camera, takeSnapshotAsync } from 'expo';
import { Accelerometer } from 'expo';
import TimerMixin from 'react-timer-mixin'
import { ColorPicker, TriangleColorPicker } from 'react-native-color-picker'

console.disableYellowBox = true;

let rotateX = 0
let rotateY = 0
Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);

export default class App extends React.Component {

  constructor(){
    super()
    this.state = {
      currentPoints: [],
      drawCurve: false,
      previousMesh: null,
      previousPoint: {},
      sameMesh: false,
      released: false,
      meshes: [],
      persist: false,
      curves: [],
      color: {r: 255, g: 0, b: 0},
      showColorPicker: false,
      arDisplay: 'container',
      clearScene: false,
      cameraRollUri: null
    }
  }

  mixins: [TimerMixin]
  componentWillMount () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onStartShouldSetPanResponderCapture: (e, gestureState) => true,
      onMoveShouldSetPanResponder: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => true,
      onPanResponderGrant: this._handleOnPanResponderGrant.bind(this),
      onPanResponderMove: this._handleOnPanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderRelease.bind(this)
    })
  }

  _handleOnPanResponderGrant = (e, gestureState) => {
    console.log("grant...")
    this.touching = true
    this.setState({drawCurve: true})
    this.setState({sameMesh: true})
  }

  _handleOnPanResponderMove = (e, gestureState) => {
  }

  _handlePanResponderRelease = (e, gestureState) => {
    console.log("done...")
    this.setState({sameMesh: false})
    this.setState({released: true})
    this.touching = false
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

  showColorPicker = () => {
    this.setState({showColorPicker: !this.state.showColorPicker})
    if(this.state.arDisplay === 'container'){
      this.setState({arDisplay: 'hiddenContainer'})
    } else {
      this.setState({arDisplay: 'container'})
    }
  }

  clearScene = () => {
    this.setState({clearScene: true})
  }

  _saveToCameraRollAsync = async () => {
    let result = await takeSnapshotAsync(this._glView, {
      format: 'png',
      result: 'file',
    });
    console.log('hello')

    let saveResult = await CameraRoll.saveToCameraRoll(result, 'photo');
    this.setState({ cameraRollUri: saveResult });
  };

  render() {
     return (
       <View
         behavior="padding"
         style={{ flex: 1 }}>
         {this.state.showColorPicker ? <TriangleColorPicker
           onColorChange={color => this.setColor(color)}
           style={{flex: 0.5, position: 'relative', top: 0, left: 0}}
         /> : null}
         {this.state.showColorPicker ? <View
           onColorChange={color => this.setColor(color)}
           style={{flex: 0.5, position: 'relative'}}
         /> : null}
         {this.state.showColorPicker ? <Button
            style={{}}
            backgroundColor="#aaa"
            title="EXTRUDE"
            onPress={() => {this.showColorPicker()}}
          /> : null }
         <Expo.GLView
           {...this.panResponder.panHandlers}
           ref={(ref) => this._glView = ref}
           style={styles[this.state.arDisplay]}
           onContextCreate={this._onGLContextCreate}
         />
         {this.state.showColorPicker ? null : <Button
            style={{position: 'absolute', bottom: 15, left: 0, width: '30%'}}
            backgroundColor="#aaa"
            title="SETTINGS"
            onPress={() => {this.showColorPicker()}}
          />
           <Button
             style={{position: 'absolute', bottom: 15, right: 0, width: '30%'}}
             backgroundColor="#aaa"
             title="CLEAR"
             onPress={() => {this.clearScene()}}
           />
           <Button
              style={{position: 'absolute', bottom: 15, left: 135, width: '30%'}}
              backgroundColor="#aaa"
              title="SNAP"
              onPress={() => {this._saveToCameraRollAsync()}}
            /> }
       </View>
     )
   }

  _onGLContextCreate = async (gl) => {
    const arSession = await this._glView.startARSessionAsync();
    const scene = new THREE.Scene();
    const camera = ExpoTHREE.createARCamera(
      arSession,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      0.01,
      1000
    );
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);

    let vector = new THREE.Vector3()
    const {
      ambientIntensity,
      ambientColorTemperature,
    } = ExpoTHREE.getARLightEstimation(arSession);

    let light = new THREE.DirectionalLight( 0xffffff, .75 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    let light2 = new THREE.DirectionalLight( 0xffffff, .25 );
    light2.position.set( 0, 0, 1 );
    scene.add( light2 );

    var light1 = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light1 );

    let newCurve
    const _addCurve = () => {
      if(this.state.drawCurve){
        newCurve = new THREE.CatmullRomCurve3([]);
        newCurve.points.push(vector)
        this.setState({previousPoint: vector})
        this.setState({drawCurve: !this.state.drawCurve})
        let stateCurves = this.state.curves.slice(0)
        stateCurves.push(newCurve)
        this.setState({curves: stateCurves})
      } else {
          newCurve.points.push(vector)
          this.setState({previousPoint: vector})
          if (newCurve.points.length > 0) {
            let extrudeSettings = {
              steps: 100,
              bevelEnabled: false,
              extrudePath: newCurve
            };
            let circleRadius = 0.01
            var shape = new THREE.Shape()
            shape.moveTo( 0, circleRadius )
            shape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
    				shape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius );
    				shape.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 );
    				shape.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );

            let color = new THREE.Color(`rgb(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b})`)

            let geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
            let material = new THREE.MeshLambertMaterial( { color: color } )
            let mesh = new THREE.Mesh( geometry, material )
            mesh.material.shading = THREE.SmoothShading
            if(!this.state.released && this.state.previousMesh){
              scene.remove(this.state.previousMesh)
            }
            scene.add( mesh )
            this.setState({previousMesh: mesh})
            let stateCurves = this.state.curves.slice(0)
            stateCurves[stateCurves.length - 1] = newCurve
            this.setState({curves: stateCurves})
          }
        }
      }

    const animate = () => {
      requestAnimationFrame(animate);
      vector = camera.getWorldPosition();
      if (this.state.released){
        _addCurve()
        this.setState({released: false})
      }

      if(this.state.clearScene){
        while(scene.children.length > 0){
            scene.remove(scene.children[0]);
        }
        let light = new THREE.DirectionalLight( 0xffffff, .75 );
        light.position.set( 0, 1, 0 );
        scene.add( light );

        let light2 = new THREE.DirectionalLight( 0xffffff, .25 );
        light2.position.set( 0, 0, 1 );
        scene.add( light2 );

        var light1 = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light1 );

        this.setState({clearScene: false})
      }
      if(this.touching){
        _addCurve()
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();
  }
}

let mapThis = function (num, inMin, inMax, outMin, outMax) {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
    container: {
      flex:1,
      overflow: 'hidden',
  },
  hiddenContainer: {
    top: window.height,
    bottom: -window.height
  }
});
